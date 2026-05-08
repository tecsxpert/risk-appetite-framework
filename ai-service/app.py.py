"""
app.py — Flask AI Microservice Entry Point
==========================================
Tool-04 | Risk Appetite Framework | AI Developer 3

This file is the Flask entry point for the AI microservice (port 5000).
It shows exactly how sanitisation.py and rate_limiter.py are registered.

Run locally:
    python app.py

Run via Docker Compose:
    docker-compose up --build
"""

import os
from flask import Flask, jsonify

# ── Middleware imports (Day 3 & Day 4 deliverables) ────────────────────────
from sanitisation import register_sanitisation
from rate_limiter import register_rate_limiter

# ── Route blueprint imports (other team members' work) ────────────────────
# from routes.describe        import describe_bp
# from routes.recommend       import recommend_bp
# from routes.categorise      import categorise_bp
# from routes.generate_report import generate_report_bp
# from routes.query           import query_bp
# from routes.health          import health_bp


def create_app() -> Flask:
    app = Flask(__name__)

    # ── Register all route blueprints ─────────────────────────────────────
    # app.register_blueprint(describe_bp)
    # app.register_blueprint(recommend_bp)
    # app.register_blueprint(categorise_bp)
    # app.register_blueprint(generate_report_bp)
    # app.register_blueprint(query_bp)
    # app.register_blueprint(health_bp)

    # ── Day 3: Input sanitisation middleware ──────────────────────────────
    # Runs before_request on every POST/PUT/PATCH with a JSON body.
    # Strips HTML, rejects prompt injection, enforces 2000-char limit.
    register_sanitisation(app)

    # ── Day 4: Rate limiting ──────────────────────────────────────────────
    # Global default : 30 req/min per IP (all endpoints).
    # /generate-report: 10 req/min per IP (applied via decorator on route).
    # 429 responses include retry_after (seconds) in JSON body.
    register_rate_limiter(app)

    # ── Health check (lightweight — not rate-limited) ─────────────────────
    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "tool04-ai"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("AI_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
