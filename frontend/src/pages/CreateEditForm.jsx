import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function CreateEditForm() {
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
          console.error('Error fetching risk:', err);
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
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} risk:`, err);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#1B4F8A' }}>
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

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1B4F8A' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1B4F8A' }}
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
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1B4F8A' }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#1B4F8A' }}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Score</label>
            <input
              type="number"
              name="score"
              value={formData.score}
              onChange={handleChange}
              min="0"
              max="100"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#1B4F8A' }}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-6 text-white font-medium rounded-md hover:opacity-90"
            style={{ backgroundColor: '#1B4F8A' }}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/risks')}
            className="py-2 px-6 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}