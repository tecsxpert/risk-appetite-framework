import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ReportStream from '../components/ReportStream';

export default function RiskList() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/api/reports/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'risks-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const fetchRisks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/risks', {
        params: { page, size: 10, sortBy, sortDir, search, status }
      });

      setRisks(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);

    } catch (err) {
      setError('Failed to load risk items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [page, sortBy, sortDir, search, status]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const getStatusBadge = (statusValue) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      ACTIVE: 'bg-blue-100 text-blue-700',
      REVIEW: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return styles[statusValue] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1B4F8A]">
          Risk Appetite Items
        </h1>

        <Link
          to="/risks/new"
          className="bg-[#1B4F8A] text-white px-5 py-2 rounded-lg shadow hover:bg-[#163e6b] transition"
        >
          + Add Risk
        </Link>
        
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search risks..."
          className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-[#1B4F8A]"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="p-3 border rounded-xl focus:ring-2 focus:ring-[#1B4F8A] min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="REVIEW">Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">

          <thead className="bg-gray-100">
            <tr>
              {['name', 'category', 'status', 'score'].map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                >
                  {col}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6">Loading...</td>
              </tr>
            ) : risks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              risks.map((risk) => (
                <tr key={risk.id} className="border-b hover:bg-blue-50 transition">
                  <td className="px-6 py-4 font-medium text-blue-600">
                    <Link to={`/risks/${risk.id}`} className="hover:underline">
                      {risk.name}
                    </Link>
                  </td>

                  <td className="px-6 py-4">{risk.category}</td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(risk.status)}`}>
                      {risk.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-bold">
                    {risk.score}
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      to={`/risks/${risk.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Prev
            </button>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      <ReportStream />
    </div>
  );
}