import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5000';

const aiService = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000,
});

export async function describeRisk(riskData) {
  const response = await aiService.post('/describe', riskData);
  return response.data;
}

export async function recommendActions(riskData) {
  const response = await aiService.post('/recommend', riskData);
  return response.data;
}

export async function generateReport(data) {
  const response = await aiService.post('/generate-report', data);
  return response.data;
}

export async function categoriseRisk(text) {
  const response = await aiService.post('/categorise', { text });
  return response.data;
}

export async function queryKnowledgeBase(question) {
  const response = await aiService.post('/query', { question });
  return response.data;
}

export async function analyseDocument(text) {
  const response = await aiService.post('/analyse-document', { text });
  return response.data;
}

export function streamReport(data, onChunk, onError) {
  const eventSource = new EventSource(`${AI_SERVICE_URL}/generate-report/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  eventSource.onmessage = (event) => {
    onChunk(event.data);
  };

  eventSource.onerror = (err) => {
    onError(err);
    eventSource.close();
  };

  return () => eventSource.close();
}

export default {
  describeRisk,
  recommendActions,
  generateReport,
  categoriseRisk,
  queryKnowledgeBase,
  analyseDocument,
  streamReport,
};