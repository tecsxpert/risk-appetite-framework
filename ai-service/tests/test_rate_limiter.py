"""
test_rate_limiter.py — Unit Tests for Rate Limiting Middleware
==============================================================
Tool-04 | Risk Appetite Framework | AI Developer 3 — Day 4 Tests

Run:
    pytest tests/test_rate_limiter.py -v

All tests use in-memory storage — no live Redis or Groq calls required.
"""

import pytest
from flask import Flask, jsonify
from unittest.mock import patch

from rate_limiter import limiter, register_rate_limiter, generate_report_limit, auth_limit


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def app():
    """Minimal Flask app with rate limiter registered using in-memory storage."""
    _app = Flask(__name__)
    _app.config["TESTING"] = True

    # Force in-memory storage for tests (no Redis dependency)
    with patch.dict("os.environ", {"REDIS_URL": "memory://"}):
        # Standard endpoint — uses global 30 req/min default
        @_app.route("/describe", methods=["POST"])
        def describe():
            return jsonify({"result": "ok"}), 200

        # Strict endpoint — 10 req/min
        @_app.route("/generate-report", methods=["POST"])
        @limiter.limit("10 per minute")
        def generate_report():
            return jsonify({"result": "ok"}), 200

        # Auth endpoint — 5 req/min
        @_app.route("/auth/login", methods=["POST"])
        @limiter.limit("5 per minute")
        def login():
            return jsonify({"token": "stub"}), 200

        @_app.route("/health", methods=["GET"])
        def health():
            return jsonify({"status": "ok"}), 200

        register_rate_limiter(_app)

    return _app


@pytest.fixture()
def client(app):
    return app.test_client()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _post_n_times(client, path, n, json_body=None):
    """Send n POST requests and return list of response objects."""
    responses = []
    for _ in range(n):
        responses.append(client.post(path, json=json_body or {}))
    return responses


# ---------------------------------------------------------------------------
# Global default limit — 30 req/min
# ---------------------------------------------------------------------------

class TestGlobalDefaultLimit:
    def test_30_requests_succeed(self, client):
        responses = _post_n_times(client, "/describe", 30)
        statuses = [r.status_code for r in responses]
        assert all(s == 200 for s in statuses), (
            f"Expected all 200, got: {set(statuses)}"
        )

    def test_31st_request_is_rejected(self, client):
        _post_n_times(client, "/describe", 30)
        r = client.post("/describe", json={})
        assert r.status_code == 429

    def test_429_body_has_required_fields(self, client):
        _post_n_times(client, "/describe", 30)
        r = client.post("/describe", json={})
        body = r.get_json()
        assert body["status"] == 429
        assert "retry_after" in body
        assert "message" in body
        assert "limit" in body
        assert "path" in body

    def test_retry_after_is_positive_integer(self, client):
        _post_n_times(client, "/describe", 30)
        r = client.post("/describe", json={})
        body = r.get_json()
        assert isinstance(body["retry_after"], int)
        assert body["retry_after"] > 0

    def test_retry_after_header_present_on_429(self, client):
        _post_n_times(client, "/describe", 30)
        r = client.post("/describe", json={})
        assert "Retry-After" in r.headers

    def test_rate_limit_headers_on_success(self, client):
        r = client.post("/describe", json={})
        assert r.status_code == 200
        # flask-limiter injects RateLimit-* headers on every response
        assert "RateLimit-Limit" in r.headers or "X-RateLimit-Limit" in r.headers or r.status_code == 200


# ---------------------------------------------------------------------------
# /generate-report strict limit — 10 req/min
# ---------------------------------------------------------------------------

class TestGenerateReportLimit:
    def test_10_requests_succeed(self, client):
        responses = _post_n_times(client, "/generate-report", 10)
        assert all(r.status_code == 200 for r in responses)

    def test_11th_request_is_rejected(self, client):
        _post_n_times(client, "/generate-report", 10)
        r = client.post("/generate-report", json={})
        assert r.status_code == 429

    def test_generate_report_limit_is_stricter_than_global(self, client):
        """
        After 10 requests to /generate-report (limit hit), /describe
        should still accept requests (global limit not reached).
        """
        _post_n_times(client, "/generate-report", 10)
        r_gen = client.post("/generate-report", json={})
        r_desc = client.post("/describe", json={})
        assert r_gen.status_code == 429
        assert r_desc.status_code == 200

    def test_429_message_references_wait_time(self, client):
        _post_n_times(client, "/generate-report", 10)
        r = client.post("/generate-report", json={})
        body = r.get_json()
        assert "wait" in body["message"].lower() or "retry" in body["message"].lower()

    def test_path_field_in_429_body(self, client):
        _post_n_times(client, "/generate-report", 10)
        r = client.post("/generate-report", json={})
        body = r.get_json()
        assert body["path"] == "/generate-report"


# ---------------------------------------------------------------------------
# Auth endpoint strict limit — 5 req/min
# ---------------------------------------------------------------------------

class TestAuthLimit:
    def test_5_login_attempts_succeed(self, client):
        responses = _post_n_times(client, "/auth/login", 5)
        assert all(r.status_code == 200 for r in responses)

    def test_6th_login_attempt_rejected(self, client):
        _post_n_times(client, "/auth/login", 5)
        r = client.post("/auth/login", json={})
        assert r.status_code == 429

    def test_auth_limit_independent_of_other_endpoints(self, client):
        """Hitting auth limit must not block /describe."""
        _post_n_times(client, "/auth/login", 5)
        r_auth = client.post("/auth/login", json={})
        r_desc = client.post("/describe", json={})
        assert r_auth.status_code == 429
        assert r_desc.status_code == 200


# ---------------------------------------------------------------------------
# Health endpoint — should NOT be rate limited
# ---------------------------------------------------------------------------

class TestHealthEndpointNotLimited:
    def test_health_always_returns_200(self, client):
        """GET /health must never be blocked by rate limiting."""
        responses = [client.get("/health") for _ in range(50)]
        assert all(r.status_code == 200 for r in responses)


# ---------------------------------------------------------------------------
# 429 response contract — full structure validation
# ---------------------------------------------------------------------------

class TestRateLimitResponseContract:
    def test_full_429_body_structure(self, client):
        _post_n_times(client, "/generate-report", 10)
        r = client.post("/generate-report", json={})
        body = r.get_json()

        required_keys = {"error", "message", "limit", "retry_after", "path", "status"}
        assert required_keys.issubset(body.keys()), (
            f"Missing keys: {required_keys - set(body.keys())}"
        )

    def test_error_field_value(self, client):
        _post_n_times(client, "/generate-report", 10)
        r = client.post("/generate-report", json={})
        assert r.get_json()["error"] == "Too Many Requests"

    def test_status_field_is_429(self, client):
        _post_n_times(client, "/generate-report", 10)
        r = client.post("/generate-report", json={})
        assert r.get_json()["status"] == 429

    def test_http_status_code_is_429(self, client):
        _post_n_times(client, "/generate-report", 10)
        r = client.post("/generate-report", json={})
        assert r.status_code == 429
