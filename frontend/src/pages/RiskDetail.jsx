import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AIPanel from '../components/AIPanel';

function StatusBadge({ status }) {
  const styles = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
    ACTIVE: 'bg-blue-100 text-blue-700 border-blue-300',
    REVIEW: 'bg-amber-100 text-amber-700 border-amber-300',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    REJECTED: 'bg-red-100 text-red-700 border-red-300',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 70
    ? 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200'
    : score >= 40
    ? 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200';
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-lg border ${color}`}>
      {score}/100
    </span>
  );
}

function InfoRow({ label, value, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-b border-gray-100 last:border-0">
      <dt className="sm:w-36 flex-shrink-0 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="flex-1 text-gray-900">
        {children || <span className="text-gray-400 italic">{value || 'Not specified'}</span>}
      </dd>
    </div>
  );
}

function SectionCard({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

export default function RiskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRisk();
  }, [id]);

  const fetchRisk = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/risks/${id}`);
      setRisk(response.data);
    } catch (err) {
      setError('Failed to load risk details. Please try again.');
      console.error('Error fetching risk:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this risk item? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/risks/${id}`);
      navigate('/risks');
    } catch (err) {
      setError('Failed to delete risk item. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-t-transparent" style={{ borderColor: '#1B4F8A', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-500 text-sm">Loading risk details...</p>
        </div>
      </div>
    );
  }

  if (error && !risk) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              <button onClick={fetchRisk} className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline">Try again</button>
            </div>
          </div>
        </div>
        <Link to="/risks" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mt-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to list
        </Link>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-4">Risk item not found</p>
          <Link to="/risks" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">← Back to list</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/risks" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to list
      </Link>

      {error && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-amber-700 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{risk.name}</h1>
              <p className="text-sm text-gray-500">Risk ID: {risk.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/risks/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4F8A] text-white text-sm font-medium rounded-lg hover:bg-[#164a75] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Risk
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
              <div className="mt-2">
                <StatusBadge status={risk.status} />
              </div>
            </div>
            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
              <div className="mt-2">
                <span className="text-gray-900 font-medium">{risk.category || 'Not specified'}</span>
              </div>
            </div>
            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Score</label>
              <div className="mt-2">
                <ScoreBadge score={risk.score || 0} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <p className="mt-2 text-gray-700 leading-relaxed">{risk.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 border-t border-gray-100 pt-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</label>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-gray-900">{risk.owner || 'Unassigned'}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</label>
              <div className="mt-2 text-gray-900">
                {risk.createdAt ? new Date(risk.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
              </div>
            </div>
          </div>

          {risk.probability && (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Probability</label>
                  <div className="mt-2 text-gray-900 font-medium">{risk.probability}%</div>
                </div>
                {risk.impact && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Impact</label>
                    <div className="mt-2 text-gray-900 font-medium">{risk.impact}%</div>
                  </div>
                )}
                {risk.mitigation && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mitigation</label>
                    <div className="mt-2 text-gray-900 font-medium">{risk.mitigation}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <SectionCard
        title="AI Analysis"
        icon={
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        }
      >
        {risk.aiAnalysis ? (
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100 mb-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{risk.aiAnalysis}</p>
            {risk.aiGeneratedAt && (
              <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-blue-100">
                Generated: {new Date(risk.aiGeneratedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4 text-center">
            <p className="text-gray-500 text-sm">No AI analysis available for this risk item.</p>
          </div>
        )}

        <AIPanel riskData={risk} mode="recommend" />
      </SectionCard>
    </div>
  );
}
