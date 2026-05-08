from flask import Blueprint, request, jsonify
from services.groq_client import groq_client
from datetime import datetime
import time
import json

batch_process_bp = Blueprint('batch_process', __name__)

@batch_process_bp.route('/batch-process', methods=['POST'])
def batch_process():
    data = request.get_json()

    if not data or 'items' not in data:
        return jsonify({"error": "Missing 'items' field"}), 400

    items = data['items']

    if not isinstance(items, list):
        return jsonify({"error": "'items' must be a list"}), 400

    if len(items) == 0:
        return jsonify({"error": "Items list cannot be empty"}), 400

    if len(items) > 20:
        return jsonify({"error": "Maximum 20 items allowed per batch"}), 400

    results = []
    processed = 0
    failed = 0

    for index, item in enumerate(items):
        try:
            if index > 0:
                time.sleep(0.1)  # 100ms delay between items

            if not isinstance(item, dict) or 'text' not in item:
                results.append({
                    "index": index,
                    "status": "failed",
                    "error": "Each item must have a 'text' field",
                    "item_id": item.get('id', f"item_{index}")
                })
                failed += 1
                continue

            text = item['text'].strip()
            item_id = item.get('id', f"item_{index}")

            if len(text) < 5:
                results.append({
                    "index": index,
                    "status": "failed",
                    "error": "Text too short",
                    "item_id": item_id
                })
                failed += 1
                continue

            # Shortened prompt — Day 13 optimisation
            prompt = f"""Analyse this risk. Return ONLY valid JSON:
{{
  "risk_level": "LOW/MEDIUM/HIGH",
  "category": "category name",
  "summary": "one sentence",
  "action_required": true or false
}}

Risk: {text[:200]}"""

            ai_response = groq_client.call(prompt)

            try:
                clean = ai_response.strip()
                if clean.startswith("```"):
                    clean = clean.split("```")[1]
                    if clean.startswith("json"):
                        clean = clean[4:]
                analysis = json.loads(clean)
            except Exception:
                analysis = {
                    "risk_level": "MEDIUM",
                    "category": "General",
                    "summary": ai_response[:100] if ai_response else "No response",
                    "action_required": True
                }

            results.append({
                "index": index,
                "item_id": item_id,
                "status": "success",
                "text": text,
                "analysis": analysis,
                "processed_at": datetime.utcnow().isoformat()
            })
            processed += 1

        except Exception as e:
            results.append({
                "index": index,
                "status": "failed",
                "error": str(e),
                "item_id": item.get('id', f"item_{index}") if isinstance(item, dict) else f"item_{index}"
            })
            failed += 1

    return jsonify({
        "results": results,
        "total_items": len(items),
        "processed": processed,
        "failed": failed,
        "completed_at": datetime.utcnow().isoformat()
    }), 200