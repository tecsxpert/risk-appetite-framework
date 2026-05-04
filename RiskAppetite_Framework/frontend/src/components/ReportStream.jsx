import { useState, useEffect, useRef } from 'react';

export default function ReportStream() {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [eventSource, setEventSource] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startStreaming = () => {
    if (connectionStatus === 'loading' || connectionStatus === 'connected') return;
    setConnectionStatus('loading');
    setMessages([]);
    
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const es = new EventSource(`${apiUrl}/api/reports/stream?token=${token}`);

    es.onopen = () => {
      setConnectionStatus('connected');
    };

    es.onmessage = (event) => {
      const timestamp = new Date().toLocaleTimeString();
      setMessages((prev) => [...prev, `[${timestamp}] ${event.data}`]);
    };

    es.onerror = () => {
      es.close();
      setConnectionStatus('error');
      setEventSource(null);
    };

    setEventSource(es);
  };

  const stopStreaming = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setConnectionStatus('disconnected');
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1B4F8A] flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {connectionStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'loading' ? 'bg-yellow-500' :
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></span>
            </span>
            Live Report Stream
          </h2>
          <p className="text-sm text-gray-500 mt-1">Real-time updates from the risk analytics engine</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            {connectionStatus !== 'connected' && connectionStatus !== 'loading' ? (
              <button
                onClick={startStreaming}
                className="bg-[#1B4F8A] text-white px-5 min-h-[44px] rounded-xl shadow-lg hover:bg-[#163e6b] hover:shadow-xl transition-all font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Start Streaming
              </button>
            ) : (
              <button
                onClick={stopStreaming}
                className="bg-red-50 text-red-600 border border-red-200 px-5 min-h-[44px] rounded-xl hover:bg-red-100 transition-all font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
                Stop Streaming
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-1 shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none opacity-50"></div>
        <div className="bg-[#0f172a] text-green-400 p-5 rounded-lg h-64 overflow-y-auto font-mono text-sm custom-scrollbar relative z-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>System ready. Click 'Start Streaming' to connect.</span>
            </div>
          ) : (
            <div className="space-y-1.5 pb-2">
              {messages.map((msg, idx) => {
                const isSystem = msg.includes('[System]');
                return (
                  <div key={idx} className={`leading-relaxed flex gap-2 ${isSystem ? 'text-blue-400' : 'text-green-400'}`}>
                    <span className="text-gray-500 select-none">{'>'}</span>
                    <span className="break-all">{msg}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
