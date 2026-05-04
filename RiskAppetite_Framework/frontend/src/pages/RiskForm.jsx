import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function RiskForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: 'DRAFT',
    score: 0,
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchRisk = async () => {
        try {
          const response = await api.get(`/api/risks/${id}`);
          const risk = response.data;
          setFormData({
            name: risk.name || '',
            category: risk.category || '',
            description: risk.description || '',
            status: risk.status || 'DRAFT',
            score: risk.score || 0,
          });
        } catch (err) {
          setError('Failed to load risk details.');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchRisk();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.category) {
      setError('Please fill in all required fields (Name and Category).');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/api/risks/${id}`, formData);
      } else {
        await api.post('/api/risks', formData);
      }
      navigate('/risks');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} risk. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4F8A]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[#1B4F8A]">
        {isEditMode ? 'Edit Risk Appetite Item' : 'Create Risk Appetite Item'}
      </h1>

      {error && (
        <div className="mb-4 max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1.5 w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/20 focus:border-[#1B4F8A] transition-all duration-200 hover:border-slate-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1.5 w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/20 focus:border-[#1B4F8A] transition-all duration-200 hover:border-slate-300"
            required
          >
            <option value="">Select category</option>
            <option value="STRATEGIC">Strategic</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="FINANCIAL">Financial</option>
            <option value="COMPLIANCE">Compliance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="mt-1.5 w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/20 focus:border-[#1B4F8A] transition-all duration-200 hover:border-slate-300 resize-y"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1.5 w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/20 focus:border-[#1B4F8A] transition-all duration-200 hover:border-slate-300"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Score</label>
            <input
              type="number"
              name="score"
              value={formData.score}
              onChange={handleChange}
              min="0"
              max="100"
              className="mt-1.5 w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/20 focus:border-[#1B4F8A] transition-all duration-200 hover:border-slate-300"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center min-w-[120px] min-h-[44px] py-2.5 px-6 bg-[#1B4F8A] text-white font-bold rounded-xl shadow-md hover:bg-[#154070] hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </div>
            ) : (
              isEditMode ? 'Update Risk' : 'Save Risk'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/risks')}
            className="py-2.5 px-6 min-h-[44px] bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}