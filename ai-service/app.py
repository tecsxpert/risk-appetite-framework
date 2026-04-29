from flask import Flask, jsonify
from flask_cors import CORS
from routes.describe import describe_bp 
from routes.recommend import recommend_bp  
from routes.report import report_bp
from routes.analyse_document import analyse_document_bp
from routes.batch_process import batch_process_bp

app = Flask(__name__)
CORS(app) 

# 1. Root Endpoint for Basic service Info
@app.route('/')
def index():
    return jsonify({
        "message": "Risk Appetite AI Service is running",
        "active_endpoints": [
            "/health",
            "/ai/describe",
            "/ai/recommend",
            "/ai/generate-report"
            "/ai/analyse-document"
            "/ai/batch-process"
        ]
    }), 200

# 2. Health Check Endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "ai-service",
        "port": 5000
    }), 200

# 3. Register Blueprints with the /ai prefix
app.register_blueprint(describe_bp, url_prefix='/ai')
app.register_blueprint(recommend_bp, url_prefix='/ai')
app.register_blueprint(report_bp, url_prefix='/ai')
app.register_blueprint(analyse_document_bp, url_prefix='/ai')
app.register_blueprint(batch_process_bp, url_prefix='/ai')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)