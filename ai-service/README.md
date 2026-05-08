# AI Service — Risk Appetite Framework

The AI microservice for the Risk Appetite Framework project. Built with Flask and powered by Groq's LLaMA-3.3-70b model with ChromaDB RAG pipeline.

---

## Prerequisites

Before running this service, ensure you have the following installed:

- Python 3.11+
- pip (Python package manager)
- A Groq API key (free at https://console.groq.com)

---

## Setup Steps

### 1. Clone the repository
```bash
git clone <repository-url>
cd risk-appetite-framework/ai-service
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Create your `.env` file
```bash
cp ../.env.example .env
```
Then open `.env` and fill in your values (see Environment Variables below).

### 4. Run the service
```bash
python app.py
```

The service will start on **http://localhost:5000**

---

## Environment Variables

Create a `.env` file in the `ai-service/` directory with these variables:

| Variable | Required | Description | Example |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key from console.groq.com | `gsk_xxx...` |

To get your Groq API key:
1. Go to https://console.groq.com
2. Sign up for a free account
3. Click API Keys → Create API Key
4. Copy and paste into your `.env` file

---

## Running Tests

```bash
cd ai-service
pytest tests/test_endpoints.py -v
```

Expected output: **10 passed**

---

## Health Check

Verify the service is running:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ai-service",
  "port": 5000
}
```

---

## API Reference

Base URL: `http://localhost:5000`

---

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-service",
  "port": 5000
}
```

---

### POST /ai/describe
Generates a structured description for a risk item.

**Request:**
```json
{
  "raw_data": "Credit Risk - High exposure in retail lending"
}
```

**Response:**
```json
{
  "description": "...",
  "generated_at": "2026-04-29T10:00:00"
}
```

---

### POST /ai/recommend
Returns 3 actionable recommendations for a risk item.

**Request:**
```json
{
  "risk_context": "Credit Risk - High exposure in retail lending"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "action_type": "Mitigation",
      "description": "Reduce lending exposure",
      "priority": "HIGH"
    }
  ],
  "generated_at": "2026-04-29T10:00:00",
  "input_context": "Credit Risk - High exposure in retail lending"
}
```

---

### POST /ai/generate-report
Generates a full risk appetite report using RAG pipeline.

**Request:**
```json
{
  "report_query": "Credit risk appetite assessment"
}
```

**Response:**
```json
{
  "report": {
    "title": "Credit Risk Appetite Report",
    "executive_summary": "...",
    "overview": "...",
    "top_items": ["..."],
    "recommendations": ["..."]
  },
  "status": "success",
  "generated_at": "2026-04-29T10:00:00"
}
```

---

### POST /ai/generate-report/stream
Streams report tokens using Server-Sent Events (SSE).

**Request:**
```json
{
  "report_query": "Credit risk appetite assessment"
}
```

**Response:** SSE stream of events:
data: {"type": "status", "message": "Retrieving context from ChromaDB..."}
data: {"type": "token", "content": "The"}
data: {"type": "token", "content": " risk"}
data: {"type": "done", "full_response": "...", "generated_at": "..."}

**Frontend usage (React):**
```javascript
const source = new EventSource('/ai/generate-report/stream');
source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'token') {
    setReport(prev => prev + data.content);
  }
};
```

---

### POST /ai/analyse-document
Analyses text and returns structured findings array.

**Request:**
```json
{
  "text": "Our organization has high exposure to credit risk in retail lending..."
}
```

**Response:**
```json
{
  "findings": [
    {
      "type": "risk",
      "title": "Inadequate Monitoring Systems",
      "description": "...",
      "severity": "HIGH",
      "category": "Operational Risk"
    }
  ],
  "summary": "...",
  "total_findings": 4,
  "risk_count": 2,
  "insight_count": 2,
  "analysed_at": "2026-04-29T10:00:00"
}
```

---

### POST /ai/batch-process
Processes up to 20 risk items in a single request with 100ms delay between items.

**Request:**
```json
{
  "items": [
    {"id": "1", "text": "High credit risk in retail lending"},
    {"id": "2", "text": "Market volatility affecting equity portfolio"}
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "index": 0,
      "item_id": "1",
      "status": "success",
      "text": "High credit risk in retail lending",
      "analysis": {
        "risk_level": "HIGH",
        "category": "Credit Risk",
        "summary": "...",
        "action_required": true
      },
      "processed_at": "2026-04-29T10:00:00"
    }
  ],
  "total_items": 2,
  "processed": 2,
  "failed": 0,
  "completed_at": "2026-04-29T10:00:00"
}
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Python 3.11 | Service language |
| Flask 3.x | Web framework |
| Groq API (LLaMA-3.3-70b) | AI model |
| ChromaDB | Vector database for RAG |
| sentence-transformers | Text embeddings |
| flask-limiter | Rate limiting |
| pytest | Unit testing |

---

## Project Structure

ai-service/
├── routes/
│   ├── describe.py          # POST /ai/describe
│   ├── recommend.py         # POST /ai/recommend
│   ├── report.py            # POST /ai/generate-report
│   ├── analyse_document.py  # POST /ai/analyse-document
│   └── batch_process.py     # POST /ai/batch-process
├── services/
│   ├── groq_client.py       # Groq API client
│   └── chroma_client.py     # ChromaDB client
├── prompts/                 # Prompt templates
├── tests/
│   └── test_endpoints.py    # 10 pytest unit tests
├── app.py                   # Flask entry point
├── requirements.txt         # Dependencies
└── README.md                # This file


---

## Common Issues

**GROQ_API_KEY not found:**
Make sure your `.env` file exists and contains `GROQ_API_KEY=your_key_here`

**ChromaDB connection error:**
The `chroma_data/` folder is created automatically on first run. Do not delete it.

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

