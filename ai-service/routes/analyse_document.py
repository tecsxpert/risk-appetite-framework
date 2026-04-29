from flask import Blueprint, request, jsonify
from services.groq_client import groq_client
from datetime import datetime

analyse_document_bp = Blueprint('analyse_document', __name__)

@analyse_document_bp.route('/analyse-document', methods=['POST'])
def analyse_document():
    """
    Day 9: Accept text, identify key insights and risks,
    return structured findings array
    """
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data['text'].strip()
    if len(text) < 10:
        return jsonify({"error": "Text too short to analyse"}), 400

    try:
        prompt = f"""You are a risk analysis expert. Analyse the following document text and identify key insights and risks.

Document Text:
{text}

Return ONLY a valid JSON object in this exact format with no extra text:
{{
  "findings": [
    {{
      "type": "insight" or "risk",
      "title": "short title",
      "description": "detailed description",
      "severity": "LOW" or "MEDIUM" or "HIGH",
      "category": "category name"
    }}
  ],
  "summary": "brief overall summary",
  "total_findings": <number>,
  "risk_count": <number>,
  "insight_count": <number>
}}

Identify at least 3 findings. Be specific and professional."""

        ai_response = groq_client.call(prompt)

        # Parse AI response into JSON
        import json
        try:
            # Clean response if needed
            clean_response = ai_response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:]
            
            result = json.loads(clean_response)

        except Exception:
            # Fallback if AI doesn't return valid JSON
            result = {
                "findings": [
                    {
                        "type": "risk",
                        "title": "Analysis Error",
                        "description": "Could not parse AI response into structured format.",
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