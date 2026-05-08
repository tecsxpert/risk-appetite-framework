from flask import Blueprint, request, jsonify
from services.groq_client import groq_client
from datetime import datetime
import json

analyse_document_bp = Blueprint('analyse_document', __name__)

@analyse_document_bp.route('/analyse-document', methods=['POST'])
def analyse_document():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data['text'].strip()
    if len(text) < 10:
        return jsonify({"error": "Text too short to analyse"}), 400

    try:
        # Shortened prompt — Day 13 optimisation
        prompt = f"""Analyse this risk item. Return ONLY valid JSON:
{{
  "findings": [
    {{"type": "risk", "title": "short title", "description": "detail", "severity": "LOW/MEDIUM/HIGH", "category": "category"}}
  ],
  "summary": "brief summary",
  "total_findings": <number>,
  "risk_count": <number>,
  "insight_count": <number>
}}

Use "risk" for negative findings and "insight" for positive findings.
Text: {text[:500]}"""

        ai_response = groq_client.call(prompt)

        try:
            clean_response = ai_response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:]
            result = json.loads(clean_response)

        except Exception:
            result = {
                "findings": [
                    {
                        "type": "risk",
                        "title": "Analysis Error",
                        "description": "Could not parse AI response.",
                        "severity": "LOW",
                        "category": "System"
                    }
                ],
                "summary": ai_response[:200] if ai_response else "No response",
                "total_findings": 1,
                "risk_count": 1,
                "insight_count": 0,
                "is_fallback": True
            }

        result["analysed_at"] = datetime.utcnow().isoformat()
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "error": "Analysis failed",
            "message": str(e),
            "is_fallback": True
        }), 503