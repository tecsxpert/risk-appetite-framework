import { useState, useEffect } from 'react';

export default function ReportStream() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  const startStreaming = () => {
    if (isStreaming) return;
    setIsStreaming(true);
    setMessages([]);
    
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const es = new EventSource(`${apiUrl}/api/reports/stream?token=${token}`);

    es.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    es.onerror = (error) => {
      es.close();
      setIsStreaming(false);
    };

    setEventSource(es);
  };

  const stopStreaming = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1B4F8A]">Live Report Stream</h2>
        <div className="flex gap-2">
          {!isStreaming ? (
            <button
              onClick={startStreaming}
              className="bg-[#1B4F8A] text-white px-4 py-2 rounded-lg hover:bg-[#163e6b] transition"
            >
              Start Stream
            </button>
          ) : (
            <button
              onClick={stopStreaming}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Stop Stream
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-48 overflow-y-auto font-mono text-sm">
        {messages.length === 0 ? (
          <span className="text-gray-500">Ready to stream...</span>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-1">{`> ${msg}`}</div>
          ))
        )}
      </div>
    </div>
  );
}
