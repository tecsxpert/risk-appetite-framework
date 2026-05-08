"""
sanitisation.py — Input Sanitisation Middleware
================================================
Tool-04 | Risk Appetite Framework | AI Developer 3 — Day 3 Task

Responsibility:
    Flask before_request middleware that runs on every incoming request.
    - Strips all HTML tags from string fields in the JSON body.
    - Detects prompt injection patterns and rejects them with HTTP 400.
    - Enforces a maximum field length of 2000 characters.
    - Logs every rejection to stderr for the security audit trail.

Usage (register in app.py):
    from sanitisation import register_sanitisation
    register_sanitisation(app)

Sprint: Monday 14 April 2026 – Friday 9 May 2026
Demo Day: Friday 9 May 2026
"""

import re
import logging
from flask import Flask, request, jsonify, g

# ---------------------------------------------------------------------------
# Logger — writes to stderr; captured by Docker Compose log driver
# ---------------------------------------------------------------------------
logger = logging.getLogger("tool04.sanitisation")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

# ---------------------------------------------------------------------------
# Configuration constants
# ---------------------------------------------------------------------------

# Maximum allowed length for any single string field in the request body.
MAX_FIELD_LENGTH: int = 2000

# HTML tag pattern — matches any <tag>, </tag>, or <tag /> construct.
_HTML_TAG_RE = re.compile(r"<[^>]+>", re.IGNORECASE)

# Prompt injection detection patterns.
# Each tuple is (human-readable label, compiled regex).
# Add new patterns here as the threat landscape evolves.
INJECTION_PATTERNS: list[tuple[str, re.Pattern]] = [
    # Classic instruction override phrases
    ("ignore_instructions",  re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|context)", re.IGNORECASE)),
    ("forget_instructions",  re.compile(r"forget\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|prompts?|context|training)", re.IGNORECASE)),
    ("disregard_prompt",     re.compile(r"disregard\s+(all\s+)?(previous|prior|above|your)?\s*(instructions?|prompts?|rules?|context)", re.IGNORECASE)),

    # System role / override attempts
    ("system_override",      re.compile(r"system\s*:?\s*override", re.IGNORECASE)),
    ("act_as_override",      re.compile(r"\bact\s+as\s+(if\s+you\s+are|a\s+)?(?!.*risk)", re.IGNORECASE)),  # "act as [something else]" — exclude legitimate "act as a risk..."
    ("new_instructions",     re.compile(r"(your\s+new\s+instructions?|new\s+system\s+prompt)", re.IGNORECASE)),
    ("jailbreak_dan",        re.compile(r"\bdo\s+anything\s+now\b|\bDAN\b", re.IGNORECASE)),

    # Prompt extraction attempts
    ("reveal_prompt",        re.compile(r"(reveal|show|print|output|display|repeat|tell me|what (is|are))\s+(your\s+)?(system\s+)?(prompt|instructions?|context|training data)", re.IGNORECASE)),
    ("output_system",        re.compile(r"output\s+(the\s+)?(system\s+prompt|initial\s+prompt|full\s+prompt|api\s+key)", re.IGNORECASE)),

    # API / secret extraction
    ("api_key_leak",         re.compile(r"(groq|openai|anthropic|api)\s*(key|secret|token|credential)", re.IGNORECASE)),

    # Role confusion / persona hijacking
    ("pretend_you_are",      re.compile(r"pretend\s+(you\s+are|to\s+be|that\s+you('re|are))", re.IGNORECASE)),
    ("you_are_now",          re.compile(r"you\s+are\s+now\s+(a\s+)?(different|new|unrestricted|jailbroken|free)", re.IGNORECASE)),

    # Delimiter injection (attempting to break out of structured prompt blocks)
    ("delimiter_injection",  re.compile(r"(###|---|\[SYSTEM\]|\[USER\]|\[ASSISTANT\]|<\|im_start\|>|<\|im_end\|>)", re.IGNORECASE)),

    # Script / code injection in text fields
    ("script_tag",           re.compile(r"<script[\s>]", re.IGNORECASE)),
    ("javascript_uri",       re.compile(r"javascript\s*:", re.IGNORECASE)),
    ("eval_exec",            re.compile(r"\b(eval|exec)\s*\(", re.IGNORECASE)),
]


# ---------------------------------------------------------------------------
# Core sanitisation functions
# ---------------------------------------------------------------------------

def strip_html(value: str) -> str:
    """
    Remove all HTML tags from a string.

    Example:
        strip_html('<b>Hello</b> <script>alert(1)</script> World')
        => 'Hello  World'
    """
    return _HTML_TAG_RE.sub("", value)


def detect_injection(value: str) -> tuple[bool, str]:
    """
    Check a string against all known prompt injection patterns.

    Returns:
        (True, label)  if an injection pattern is matched.
        (False, "")    if the string is clean.
    """
    for label, pattern in INJECTION_PATTERNS:
        if pattern.search(value):
            return True, label
    return False, ""


def sanitise_value(field_name: str, raw_value: str) -> tuple[str | None, str | None]:
    """
    Full sanitisation pipeline for a single string field:
        1. Strip HTML.
        2. Check length.
        3. Detect prompt injection.

    Returns:
        (sanitised_value, None)          — field is clean; use sanitised_value.
        (None, error_message)            — field failed validation; reject request.
    """
    # Step 1 — strip HTML
    cleaned = strip_html(raw_value)

    # Step 2 — length check (applied after stripping so tags don't inflate count)
    if len(cleaned) > MAX_FIELD_LENGTH:
        return None, (
            f"Field '{field_name}' exceeds the maximum allowed length of "
            f"{MAX_FIELD_LENGTH} characters "
            f"(received {len(cleaned)} characters after HTML stripping)."
        )

    # Step 3 — prompt injection detection
    injected, label = detect_injection(cleaned)
    if injected:
        logger.warning(
            "Prompt injection detected | field='%s' | pattern='%s' | "
            "ip='%s' | path='%s'",
            field_name,
            label,
            request.remote_addr,
            request.path,
        )
        return None, (
            f"Field '{field_name}' contains disallowed content "
            f"(pattern: {label}). "
            "Please revise your input and resubmit."
        )

    return cleaned, None


def sanitise_dict(data: dict, parent_key: str = "") -> tuple[dict | None, str | None]:
    """
    Recursively sanitise all string values in a JSON-decoded dictionary.
    Non-string values (int, float, bool, list, nested dict) are preserved
    as-is, except that nested dicts and lists of strings are also sanitised.

    Returns:
        (sanitised_dict, None)     — all fields clean.
        (None, error_message)      — at least one field failed; reject request.
    """
    sanitised: dict = {}

    for key, value in data.items():
        full_key = f"{parent_key}.{key}" if parent_key else key

        if isinstance(value, str):
            clean, error = sanitise_value(full_key, value)
            if error:
                return None, error
            sanitised[key] = clean

        elif isinstance(value, dict):
            clean_dict, error = sanitise_dict(value, full_key)
            if error:
                return None, error
            sanitised[key] = clean_dict

        elif isinstance(value, list):
            clean_list = []
            for i, item in enumerate(value):
                if isinstance(item, str):
                    clean_item, error = sanitise_value(f"{full_key}[{i}]", item)
                    if error:
                        return None, error
                    clean_list.append(clean_item)
                elif isinstance(item, dict):
                    clean_item_dict, error = sanitise_dict(item, f"{full_key}[{i}]")
                    if error:
                        return None, error
                    clean_list.append(clean_item_dict)
                else:
                    clean_list.append(item)
            sanitised[key] = clean_list

        else:
            # int, float, bool, None — pass through unchanged
            sanitised[key] = value

    return sanitised, None


# ---------------------------------------------------------------------------
# Flask middleware registration
# ---------------------------------------------------------------------------

def register_sanitisation(app: Flask) -> None:
    """
    Register the sanitisation before_request hook on a Flask application.

    Call this once in app.py after creating the Flask instance:

        app = Flask(__name__)
        register_sanitisation(app)
    """

    @app.before_request
    def sanitise_request_body():
        """
        Runs before every request handler.

        - Skips GET, HEAD, OPTIONS requests (no body expected).
        - Skips requests with non-JSON Content-Type.
        - Parses and sanitises all string fields in the JSON body.
        - Stores the sanitised copy in flask.g.sanitised_body for use
          in route handlers (access via g.sanitised_body).
        - Returns HTTP 400 immediately if any field fails validation.
        """
        # Only inspect methods that carry a body
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return

        # Only inspect JSON bodies
        content_type = request.content_type or ""
        if "application/json" not in content_type:
            return

        # Parse JSON — return 400 on malformed JSON
        try:
            raw_body = request.get_json(force=False, silent=False)
        except Exception:
            return jsonify({
                "error": "Invalid JSON",
                "message": "Request body could not be parsed as JSON.",
                "status": 400,
            }), 400

        if raw_body is None:
            return

        # Only sanitise dict bodies (standard REST API payloads)
        if not isinstance(raw_body, dict):
            return

        # Run the full sanitisation pipeline
        sanitised, error = sanitise_dict(raw_body)

        if error:
            logger.warning(
                "Request rejected by sanitisation middleware | ip='%s' | "
                "path='%s' | method='%s' | reason='%s'",
                request.remote_addr,
                request.path,
                request.method,
                error,
            )
            return jsonify({
                "error": "Input validation failed",
                "message": error,
                "status": 400,
            }), 400

        # Store sanitised body on flask.g for downstream route handlers
        g.sanitised_body = sanitised

    logger.info("Input sanitisation middleware registered successfully.")
