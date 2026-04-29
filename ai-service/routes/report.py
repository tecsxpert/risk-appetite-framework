from flask import Blueprint, request, jsonify, Response, stream_with_context
from services.chroma_client import chroma_rag
from services.groq_client import groq_client
import os
import json
from datetime import datetime

report_bp = Blueprint('report', __name__)


# ─── ORIGINAL NON-STREAMING ENDPOINT (keep this working) ──────────
@report_bp.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.get_json()
    if not data or 'report_query' not in data:
        return jsonify({"error": "Missing 'report_query'"}), 400

    report_query = data['report_query']

    try:
        results = chroma_rag.collection.query(
            query_texts=[report_query],
            n_results=3
        )
        retrieved_context = " ".join(results['documents'][0])

        template_path = os.path.join('prompts', 'report_template.txt')
        with open(template_path, 'r') as f:
            template = f.read()

        full_prompt = template.format(
            retrieved_context=retrieved_context,
            report_query=report_query
        )

        ai_response = groq_client.call(full_prompt)

        try:
            if isinstance(ai_response, str):
                report_content = json.loads(ai_response)
            else:
                report_content = ai_response
        except Exception:
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


# ─── NEW SSE STREAMING ENDPOINT ────────────────────────────────────
@report_bp.route('/generate-report/stream', methods=['POST'])
def generate_report_stream():
    """
    Day 8: SSE streaming endpoint
    Streams AI report tokens one by one to the frontend
    Frontend reads using EventSource
    """
    data = request.get_json()
    if not data or 'report_query' not in data:
        return jsonify({"error": "Missing 'report_query'"}), 400

    report_query = data['report_query']

    def stream_tokens():
        try:
            # Step 1 — Send status update to frontend
            yield f"data: {json.dumps({'type': 'status', 'message': 'Retrieving context from ChromaDB...'})}\n\n"

            # Step 2 — RAG retrieval from ChromaDB
            results = chroma_rag.collection.query(
                query_texts=[report_query],
                n_results=3
            )
            retrieved_context = " ".join(results['documents'][0])

            yield f"data: {json.dumps({'type': 'status', 'message': 'Generating report with AI...'})}\n\n"

            # Step 3 — Load prompt template
            template_path = os.path.join('prompts', 'report_template.txt')
            with open(template_path, 'r') as f:
                template = f.read()

            full_prompt = template.format(
                retrieved_context=retrieved_context,
                report_query=report_query
            )

            # Step 4 — Stream from Groq API
            from groq import Groq
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))

            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": full_prompt}],
                stream=True,  # Enable streaming
                max_tokens=1000,
                temperature=0.3
            )

            # Step 5 — Stream each token to frontend
            full_response = ""
            for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    full_response += token
                    # Send each token as SSE event
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            # Step 6 — Send completion event with full response
            yield f"data: {json.dumps({'type': 'done', 'full_response': full_response, 'generated_at': datetime.utcnow().isoformat()})}\n\n"

        except Exception as e:
            # Send error as SSE event — never crash
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'is_fallback': True})}\n\n"

    return Response(
        stream_with_context(stream_tokens()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',  # Important for Nginx
            'Access-Control-Allow-Origin': '*'
        }
    )