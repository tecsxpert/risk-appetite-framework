import { useState, useCallback } from 'react';
import api from '../services/api';

// --- Icons ---
const SparklesIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LoaderIcon = ({ className = "w-5 h-5" }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const AlertCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshCwIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BrainIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

// --- API Call ---
async function fetchAIRecommendation(riskData) {
  const response = await api.post('/api/ai/recommend', riskData, {
    timeout: 30000,
  });
  return response.data;
}

// --- Sub-components ---
function AskAIButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group relative inline-flex items-center justify-center px-8 min-h-[44px] text-sm font-bold text-white transition-all duration-300 bg-[#1B4F8A] border border-transparent rounded-xl shadow-lg hover:bg-[#154070] hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4F8A] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg overflow-hidden"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative flex items-center gap-2.5">
        {loading ? (
          <>
            <LoaderIcon className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <BrainIcon className="w-5 h-5" />
            <span>Ask AI</span>
          </>
        )}
      </span>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 space-y-6 animate-in fade-in duration-400">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-400 rounded-2xl blur-xl animate-pulse opacity-30"></div>
        <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100/50 shadow-inner">
          <LoaderIcon className="w-10 h-10 text-indigo-600" />
        </div>
      </div>
      <div className="flex flex-col items-center text-center max-w-sm">
        <span className="text-base font-bold text-slate-800 tracking-tight">AI is thinking...</span>
        <span className="text-sm text-slate-500 mt-2 leading-relaxed">Generating personalized recommendations based on your risk data</span>
      </div>
      <div className="flex items-center gap-1.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50/80 to-orange-50/80 border border-red-200/60 shadow-sm animate-in fade-in slide-in-from-top-4 duration-400">
      <div className="flex items-start gap-4">
        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-red-100">
          <AlertCircleIcon className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-red-900">Request Failed</h4>
          <p className="text-sm text-red-700/80 mt-1.5 leading-relaxed">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-semibold text-red-700 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-14 px-6 text-center animate-in fade-in duration-700">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100/80 to-purple-100/80 ring-4 ring-indigo-50/50 mb-6">
        <SparklesIcon className="w-10 h-10 text-indigo-500" />
      </div>
      <h4 className="text-lg font-bold text-slate-800 mb-2">Ready for AI Insights</h4>
      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        Click <span className="font-semibold text-indigo-600">Ask AI</span> to get intelligent risk recommendations and actionable insights.
      </p>
    </div>
  );
}

function ResponseCard({ recommendation, index }) {
  const priorityConfig = {
    HIGH: {
      bg: 'from-red-50/60 to-rose-50/40',
      border: 'border-red-200/60',
      accent: 'bg-gradient-to-b from-red-500 to-rose-600',
      badge: 'bg-red-100 text-red-700 border-red-200',
      icon: 'text-red-500',
    },
    MEDIUM: {
      bg: 'from-amber-50/60 to-yellow-50/40',
      border: 'border-amber-200/60',
      accent: 'bg-gradient-to-b from-amber-500 to-orange-500',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: 'text-amber-500',
    },
    LOW: {
      bg: 'from-emerald-50/60 to-green-50/40',
      border: 'border-emerald-200/60',
      accent: 'bg-gradient-to-b from-emerald-500 to-teal-600',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: 'text-emerald-500',
    },
  };

  const config = priorityConfig[recommendation.priority?.toUpperCase()] || priorityConfig.MEDIUM;

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} p-5 transition-all duration-300 hover:shadow-lg hover:shadow-${recommendation.priority?.toLowerCase()}-500/10 hover:-translate-y-0.5`}>
      <div className="flex items-start gap-4">
        <div className={`${config.accent} p-2.5 rounded-xl text-white shadow-sm flex-shrink-0`}>
          <span className="text-lg font-black">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <h5 className="text-base font-bold text-slate-900 tracking-tight">
              {recommendation.action_type || recommendation.title || 'Recommendation'}
            </h5>
            {recommendation.priority && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.badge}`}>
                {recommendation.priority}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600/90 leading-relaxed">
            {recommendation.description || recommendation.text}
          </p>
          {recommendation.impact && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Expected Impact:</span>
              <span className={`font-semibold ${config.icon}`}>{recommendation.impact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessMeta({ timestamp }) {
  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200/60">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
        <span>Generated at {timestamp}</span>
      </div>
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100/80">
        AI-Powered
      </span>
    </div>
  );
}

// --- Main Component ---
export default function AIPanel({ riskData, mode = 'recommend' }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleAskAI = useCallback(async () => {
    if (!riskData) {
      setError('No risk data available. Please select or enter risk information first.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const data = mode === 'categorise'
        ? { text: riskData.description || riskData.name }
        : riskData;

      const result = await fetchAIRecommendation(data);
      setResponse(result);
    } catch (err) {
      const message = err.response?.data?.message
        || err.message
        || 'Unable to get AI response. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [riskData, mode]);

  const recommendations = response?.recommendations
    || (Array.isArray(response) ? response : []);

  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100/60 bg-white/95 backdrop-blur-xl shadow-xl shadow-indigo-100/20 transition-all duration-300">
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="p-6 sm:p-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100/80 to-purple-100/80 border border-indigo-200/50 shadow-sm">
              <SparklesIcon className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl tracking-tight">
                AI Risk Advisor
              </h3>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">
                Intelligent recommendations
              </p>
            </div>
          </div>

          <AskAIButton onClick={handleAskAI} loading={loading} />
        </div>

        {/* Content Area */}
        <div className="relative min-h-[180px] rounded-2xl bg-slate-50/60 border border-slate-100/80 p-3">
          {loading && <LoadingState />}

          {error && !loading && (
            <ErrorState error={error} onRetry={handleAskAI} />
          )}

          {!loading && !response && !error && (
            <EmptyState />
          )}

          {response && !loading && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {recommendations.length > 0 ? (
                <>
                  <div className="grid gap-3">
                    {recommendations.map((rec, index) => (
                      <ResponseCard
                        key={index}
                        recommendation={rec}
                        index={index}
                      />
                    ))}
                  </div>
                  <SuccessMeta timestamp={timestamp} />
                </>
              ) : response.description || response.text ? (
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {response.description || response.text}
                    </p>
                  </div>
                  <SuccessMeta timestamp={timestamp} />
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
