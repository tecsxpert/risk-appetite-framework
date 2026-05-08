import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add ai-service root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

# ─── TEST CLIENT SETUP ────────────────────────────────────────────
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# ─── MOCK GROQ RESPONSE ───────────────────────────────────────────
MOCK_DESCRIBE_RESPONSE = json.dumps({
    "title": "Credit Risk Analysis",
    "executive_summary": "High exposure in retail lending.",
    "overview": "Risk is moderate.",
    "top_items": ["Default rates", "Market volatility"],
    "recommendations": ["Diversify portfolio", "Increase monitoring"]
})

MOCK_RECOMMEND_RESPONSE = json.dumps([
    {"action_type": "Mitigation", "description": "Reduce exposure", "priority": "HIGH"},
    {"action_type": "Avoidance", "description": "Exit risky markets", "priority": "MEDIUM"},
    {"action_type": "Transfer", "description": "Get insurance", "priority": "LOW"}
])

MOCK_ANALYSE_RESPONSE = json.dumps({
    "findings": [
        {
            "type": "risk",
            "title": "High Credit Exposure",
            "description": "Organization has high credit risk.",
            "severity": "HIGH",
            "category": "Financial Risk"
        },
        {
            "type": "insight",
            "title": "Strong Capital Reserves",
            "description": "Capital reserves provide buffer.",
            "severity": "LOW",
            "category": "Financial Strength"
        }
    ],
    "summary": "Mixed risk profile.",
    "total_findings": 2,
    "risk_count": 1,
    "insight_count": 1
})

# ─── TEST 1: Health check returns 200 ─────────────────────────────
def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

# ─── TEST 2: Root endpoint returns active endpoints ───────────────
def test_root_endpoint(client):
    response = client.get('/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'active_endpoints' in data

# ─── TEST 3: /ai/describe returns description ─────────────────────
@patch('services.groq_client.groq_client.call', return_value=MOCK_DESCRIBE_RESPONSE)
def test_describe_success(mock_groq, client):
    response = client.post('/ai/describe',
        json={'raw_data': 'Credit Risk - High exposure in retail lending'},
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'description' in data
    assert 'generated_at' in data

# ─── TEST 4: /ai/describe missing field returns 400 ───────────────
def test_describe_missing_field(client):
    response = client.post('/ai/describe',
        json={},
        content_type='application/json'
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

# ─── TEST 5: /ai/recommend returns recommendations ────────────────
@patch('services.groq_client.groq_client.call', return_value=MOCK_RECOMMEND_RESPONSE)
def test_recommend_success(mock_groq, client):
    response = client.post('/ai/recommend',
        json={'risk_context': 'Credit Risk - High exposure'},
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'recommendations' in data
    assert isinstance(data['recommendations'], list)

# ─── TEST 6: /ai/recommend missing field returns 400 ──────────────
def test_recommend_missing_field(client):
    response = client.post('/ai/recommend',
        json={},
        content_type='application/json'
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

# ─── TEST 7: /ai/analyse-document returns findings array ──────────
@patch('services.groq_client.groq_client.call', return_value=MOCK_ANALYSE_RESPONSE)
def test_analyse_document_success(mock_groq, client):
    response = client.post('/ai/analyse-document',
        json={'text': 'Our organization has high credit risk exposure in retail lending.'},
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'findings' in data
    assert isinstance(data['findings'], list)
    assert 'total_findings' in data

# ─── TEST 8: /ai/analyse-document missing field returns 400 ───────
def test_analyse_document_missing_field(client):
    response = client.post('/ai/analyse-document',
        json={},
        content_type='application/json'
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

# ─── TEST 9: /ai/analyse-document text too short returns 400 ──────
def test_analyse_document_short_text(client):
    response = client.post('/ai/analyse-document',
        json={'text': 'Hi'},
        content_type='application/json'
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

# ─── TEST 10: /ai/generate-report missing field returns 400 ───────
def test_generate_report_missing_field(client):
    response = client.post('/ai/generate-report',
        json={},
        content_type='application/json'
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data