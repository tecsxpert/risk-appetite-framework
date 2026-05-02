from flask import Blueprint, request, jsonify
from services.chroma_client import chroma_rag
from services.groq_client import groq_client
import os
import json
from datetime import datetime

report_bp = Blueprint('report', __name__)

@report_bp.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.get_json()
    if not data or 'report_query' not in data:
        return jsonify({"error": "Missing 'report_query'"}), 400

    report_query = data['report_query']

    # 1. ACTUAL RETRIEVAL (From your Day 5 work)
    # This pulls the real text chunks stored in ChromaDB
    results = chroma_rag.collection.query(
        query_texts=[report_query],
        n_results=3
    )
    retrieved_context = " ".join(results['documents'][0])

    # 2. DYNAMIC PROMPTING
    try:
        template_path = os.path.join('prompts', 'report_template.txt')
        with open(template_path, 'r') as f:
            template = f.read()

        full_prompt = template.format(
            retrieved_context=retrieved_context,
            report_query=report_query
        )

        # 3. ACTUAL AI CALL
        ai_response = groq_client.call(full_prompt)

        # 4. DYNAMIC PARSING (No more hardcoding!)
        # We try to turn the AI's string response into a real JSON object
        try:
            # If the AI returns a valid JSON string, this will work
            if isinstance(ai_response, str):
                report_content = json.loads(ai_response)
            else:
                report_content = ai_response
        except Exception:
            # FALLBACK: Only if the AI completely messes up the format
            report_content = {
                "title": "Analysis Failure",
                "executive_summary": "The AI failed to return a valid JSON format.",
                "overview": f"Context used: {retrieved_context[:100]}...",
                "top_items": ["Parsing Error"],
                "recommendations": ["Check Groq API Connection"]
            }

        return jsonify({
            "report": report_content,
            "status": "success",
            "generated_at": datetime.utcnow().isoformat(),
            "source_context_used": retrieved_context[:200] + "..."
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500