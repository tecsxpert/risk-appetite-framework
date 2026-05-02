from flask import Blueprint, request, jsonify
from services.groq_client import groq_client # Provided by AI Developer 2 
import os
from datetime import datetime

recommend_bp = Blueprint('recommend', __name__)

@recommend_bp.route('/recommend', methods=['POST'])
def get_recommendations():
    data = request.get_json()
    
    # 1. Validation 
    if not data or 'risk_context' not in data:
        return jsonify({"error": "Missing 'risk_context' field"}), 400

    risk_context = data['risk_context']

    # 2. Load Prompt Template 
    try:
        template_path = os.path.join('prompts', 'recommendation_template.txt')
        with open(template_path, 'r') as f:
            template = f.read()
    except FileNotFoundError:
        return jsonify({"error": "Prompt template missing"}), 500

    full_prompt = template.format(risk_context=risk_context)

    # 3. Call AI Service with Fallback Logic 
    try:
        recommendations = groq_client.call(full_prompt)
        
        # SAFETY CHECK: If AI Dev 2's client is still returning a string (dummy code),
        # we convert it to the required list format for Day 4 compliance.
        if isinstance(recommendations, str):
            recommendations = [
                {"action_type": "Mitigation", "description": recommendations, "priority": "Medium"},
                {"action_type": "Avoidance", "description": "Review logs for further insights.", "priority": "High"},
                {"action_type": "Transfer", "description": "Consult with security lead.", "priority": "Low"}
            ]

        return jsonify({
            "recommendations": recommendations[:3], # Ensure exactly 3 
            "generated_at": datetime.utcnow().isoformat(),
            "input_context": risk_context
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": "AI service unavailable",
            "is_fallback": True,
            "recommendations": [
                {"action_type": "Mitigation", "description": "Perform manual risk assessment.", "priority": "High"},
                {"action_type": "Transfer", "description": "Evaluate insurance coverage.", "priority": "Medium"},
                {"action_type": "Avoidance", "description": "Disable affected service temporarily.", "priority": "High"}
            ]
        }), 200