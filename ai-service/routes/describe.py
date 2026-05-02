import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from services.groq_client import groq_client # Day 2: Integration depends on services/groq_client.py built by AI Developer 2 


describe_bp = Blueprint('describe', __name__)

@describe_bp.route('/describe', methods=['POST'])
def describe_risk():
    """
    Day 3 Work: Handles raw risk data processing 
    """
    # Day 3: Validate input existence 
    data = request.get_json()
    if not data or 'raw_data' not in data:
        return jsonify({"error": "Missing 'raw_data' field"}), 400
    
    raw_input = data['raw_data']

    try:
        # Day 2 Work: Load the refined prompt template 
        prompt_path = os.path.join('prompts', 'risk_description.txt')
        with open(prompt_path, 'r') as f:
            template = f.read()

        # Day 3 Work: Call Groq API and return structured JSON with timestamp 
        ai_response = groq_client.call(f"{template}\n\nRaw Input: {raw_input}")# Uses Llama-3.3-70b

        return jsonify({
            "description": ai_response,
            "generated_at": datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        # Day 3: Controlled error handling to prevent 500 status codes 
        return jsonify({
            "error": "AI Service unavailable",
            "message": str(e),
            "is_fallback": True
        }), 503