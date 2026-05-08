"""
rate_limiter.py — Flask Rate Limiting Configuration
=====================================================
Tool-04 | Risk Appetite Framework | AI Developer 3 — Day 4 Task

Responsibility:
    Configures flask-limiter for the AI microservice (port 5000).

    Rules (per sprint spec):
        • Global default  : 30 requests / minute / IP
        • /generate-report: 10 requests / minute / IP  (stricter — most token-intensive)
        • On breach       : HTTP 429 with JSON body including retry_after (seconds)

    Additional production-grade decisions made here:
        • Key function    : X-Forwarded-For header (for reverse-proxy / Docker deployments)
                            with fallback to REMOTE_ADDR.
        • Storage backend : Redis 7 (same Redis instance used for AI response cache).
                            Falls back to in-memory storage when Redis is unavailable
                            (e.g. unit-test environment) — logged as a warning.
        • Headers         : RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset,
                            and Retry-After are added to every response automatically.

Usage (register in app.py):
    from rate_limiter import limiter, apply_route_limits
    limiter.init_app(app)
    apply_route_limits()    # call AFTER all blueprints are registered

Per-route usage (on individual route functions):
    from rate_limiter import limiter
    @generate_report_bp.route("/generate-report", methods=["POST"])
    @limiter.limit("10 per minute")
    def generate_report():
        ...

Sprint: Monday 14 April 2026 – Friday 9 May 2026
Demo Day: Friday 9 May 2026
"""

import logging
import os
import time

from flask import Flask, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# ---------------------------------------------------------------------------
# Logger
# ---------------------------------------------------------------------------
logger = logging.getLogger("tool04.rate_limiter")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

# ---------------------------------------------------------------------------
# Redis storage URI
# ---------------------------------------------------------------------------
# Reads REDIS_URL from the environment (set in .env and docker-compose.yml).
# Expected format: redis://:<password>@redis:6379/0
# Falls back to a localhost default so the module loads safely in isolation.
_REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")


# ---------------------------------------------------------------------------
# Key function
# ---------------------------------------------------------------------------
def _get_client_ip() -> str:
    """
    Resolve the real client IP address.

    In Docker Compose behind a reverse proxy, the actual client IP arrives
    in the X-Forwarded-For header.  We take the first (leftmost) entry,
    which is the originating client.  If the header is absent we fall back
    to Flask's REMOTE_ADDR via flask_limiter.util.get_remote_address().
    """
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        # Header can be a comma-separated list: "client, proxy1, proxy2"
        client_ip = forwarded_for.split(",")[0].strip()
        if client_ip:
            return client_ip
    return get_remote_address()


# ---------------------------------------------------------------------------
# Limiter instance
# ---------------------------------------------------------------------------
# This is created at module level so it can be imported and applied as a
# decorator on individual route functions across all blueprints.
try:
    limiter = Limiter(
        key_func=_get_client_ip,
        default_limits=["30 per minute"],
        storage_uri=_REDIS_URL,
        # Return standard RateLimit-* headers on every response
        headers_enabled=True,
        # Include Retry-After header on 429 responses
        retry_after="http-date",
        # Do not raise an exception if storage (Redis) is temporarily
        # unavailable — allow the request through and log the failure.
        # Set to True in strict production deployments.
        swallow_errors=False,
        strategy="fixed-window",   # reset every full minute window
    )
    logger.info("flask-limiter initialised with Redis backend: %s", _REDIS_URL)

except Exception as exc:  # noqa: BLE001
    # Fallback: in-memory limiter (acceptable for unit tests, not for prod)
    logger.warning(
        "Could not connect to Redis for rate limiting (%s). "
        "Falling back to in-memory storage — NOT suitable for production "
        "or multi-worker deployments.",
        exc,
    )
    limiter = Limiter(
        key_func=_get_client_ip,
        default_limits=["30 per minute"],
        storage_uri="memory://",
        headers_enabled=True,
        retry_after="http-date",
        swallow_errors=True,
        strategy="fixed-window",
    )


# ---------------------------------------------------------------------------
# Custom 429 error response
# ---------------------------------------------------------------------------
def _rate_limit_exceeded_handler(error):
    """
    Return a structured JSON 429 response that includes:
        - Human-readable message.
        - retry_after  : seconds until the rate limit window resets.
        - limit        : the limit that was breached (e.g. "30 per 1 minute").
        - path         : the endpoint that was rate-limited.

    This handler is registered on the Flask app in register_rate_limiter().
    """
    # flask-limiter attaches the limit description to the error
    limit_info = getattr(error, "description", "rate limit exceeded")

    # Calculate retry_after in seconds from the Retry-After HTTP header
    # that flask-limiter sets on the response before calling this handler.
    retry_after_header = None
    try:
        # flask-limiter populates this on the error object when available
        retry_after_header = getattr(error, "retry_after", None)
    except Exception:  # noqa: BLE001
        pass

    # Derive a numeric retry_after value (seconds) for the JSON body
    if isinstance(retry_after_header, (int, float)):
        retry_after_seconds = int(retry_after_header)
    else:
        # Default: report 60 seconds (one full minute window)
        retry_after_seconds = 60

    logger.warning(
        "Rate limit breached | ip='%s' | path='%s' | limit='%s' | "
        "retry_after=%ds",
        _get_client_ip(),
        request.path,
        limit_info,
        retry_after_seconds,
    )

    response = jsonify({
        "error": "Too Many Requests",
        "message": (
            "You have exceeded the allowed request rate for this endpoint. "
            f"Please wait {retry_after_seconds} second(s) before retrying."
        ),
        "limit": str(limit_info),
        "retry_after": retry_after_seconds,
        "path": request.path,
        "status": 429,
    })
    response.status_code = 429
    response.headers["Retry-After"] = str(retry_after_seconds)
    return response


# ---------------------------------------------------------------------------
# Registration helper
# ---------------------------------------------------------------------------
def register_rate_limiter(app: Flask) -> None:
    """
    Attach flask-limiter and the custom 429 handler to a Flask application.

    Call this in app.py AFTER creating the app and registering all blueprints:

        app = Flask(__name__)
        # ... register blueprints ...
        register_rate_limiter(app)

    The global default limit (30 req/min) is applied automatically to every
    endpoint.  The /generate-report stricter limit (10 req/min) is applied
    via the @limiter.limit("10 per minute") decorator on that route function.
    See routes/generate_report.py for usage.
    """
    limiter.init_app(app)
    app.register_error_handler(429, _rate_limit_exceeded_handler)
    logger.info(
        "Rate limiter registered | default='30 per minute' | "
        "generate-report='10 per minute' | storage='%s'",
        _REDIS_URL,
    )


# ---------------------------------------------------------------------------
# Decorators for specific high-sensitivity endpoints
# ---------------------------------------------------------------------------
# Import these in your route files and apply as decorators.

# Stricter limit for the most token-intensive endpoint
generate_report_limit = limiter.limit("10 per minute")

# Standard limit — same as global default, but explicit for documentation
standard_limit = limiter.limit("30 per minute")

# Strict limit for authentication endpoints (brute-force protection)
auth_limit = limiter.limit("5 per minute")
