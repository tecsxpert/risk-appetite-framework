"""
generate_report.py — /generate-report Route
============================================
Tool-04 | Risk Appetite Framework | AI Developer 2 (route) + AI Developer 3 (limits)

This file demonstrates how AI Developer 3's rate_limiter.py decorator
(@generate_report_limit) is applied to the most token-intensive endpoint.

Sprint spec requirement:
    "Add flask-limiter — 30 req/min default, 10 req/min on /generate-report,
     return 429 with retry_after on breach"
"""

from flask import Blueprint, jsonify, g
from rate_limiter import generate_report_limit   # AI Developer 3's decorator

generate_report_bp = Blueprint("generate_report", __name__)


@generate_report_bp.route("/generate-report", methods=["POST"])
@generate_report_limit   # ← AI Developer 3: 10 req/min, overrides global 30 req/min
def generate_report():
    """
    POST /generate-report

    Accepts a sanitised JSON body (HTML-stripped, injection-checked by
    sanitisation.py before_request middleware) and generates a structured
    risk appetite report via the Groq LLaMA-3.3-70b model.

    Rate limit : 10 requests / minute / IP  (strictest in the service)
    Auth       : Validated upstream by AiServiceClient.java (Spring Boot)
    """
    # g.sanitised_body is set by sanitisation.py middleware (Day 3)
    body = getattr(g, "sanitised_body", {})

    # ── TODO (AI Developer 2): call GroqClient and build the report ───────
    # report = groq_client.generate_report(body)

    # Stub response for integration testing
    return jsonify({
        "title": "Risk Appetite Framework — Quarterly Report",
        "executive_summary": "Stub — replace with Groq output.",
        "overview": "",
        "top_items": [],
        "recommendations": [],
        "meta": {
            "model_used": "llama-3.3-70b-versatile",
            "cached": False,
            "is_fallback": False,
        },
    }), 200
