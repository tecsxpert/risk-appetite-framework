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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-[#1B4F8A]">
          Risk Appetite Items
        </h1>

        <div className="flex gap-3">
          <Link
            to="/risks/new"
            className="flex items-center gap-2 bg-[#1B4F8A] text-white px-5 min-h-[44px] rounded-xl shadow-md hover:bg-[#154070] hover:shadow-lg active:scale-95 transition-all font-semibold text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Risk
          </Link>
          
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 min-h-[44px] rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg active:scale-95 transition-all font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            )}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search risks..."
          className="flex-1 p-3 min-h-[44px] border rounded-xl focus:ring-2 focus:ring-[#1B4F8A]"
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
          className="p-3 min-h-[44px] border rounded-xl focus:ring-2 focus:ring-[#1B4F8A] min-w-[150px]"
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
        <div className="overflow-x-auto">
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
                <td colSpan="5" className="text-center py-12">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#1B4F8A] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-medium">Loading risks...</span>
                  </div>
                </td>
              </tr>
            ) : risks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No risks found</h3>
                    <p className="text-gray-500 text-sm max-w-sm">We couldn't find any risk items matching your current filters. Try adjusting your search criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              risks.map((risk) => (
                <tr key={risk.id} className="border-b hover:bg-blue-50 transition">
                  <td className="px-6 py-4 font-medium text-[#1B4F8A]">
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
                      className="text-[#1B4F8A] hover:text-[#0f3566] font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-t gap-4">
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 min-h-[44px] bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition font-medium"
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