import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend 
} from 'recharts';
import api from '../services/api';

const COLORS = ['#1B4F8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

function KPICard({ title, value, color, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className={`text-4xl font-black ${color}`}>{value}</p>
            {trend && (
              <span className={`text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${icon.bg} shadow-inner`}>
          {icon.svg}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-lg h-32"></div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg h-[450px]"></div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/risks/stats');
      const data = response.data;

      setStats({
        total: data.total || 0,
        high: data.high || 0,
        medium: data.medium || 0,
        low: data.low || 0,
      });

      setChartData(data.byCategory || [
        { category: 'Strategic', count: 12 },
        { category: 'Operational', count: 19 },
        { category: 'Financial', count: 8 },
        { category: 'Compliance', count: 15 },
      ]);
    } catch (err) {
      setError('Live data synchronization failed. Displaying cached/demo metrics.');
      setStats({ total: 45, high: 12, medium: 18, low: 15 });
      setChartData([
        { category: 'Strategic', count: 12 },
        { category: 'Operational', count: 19 },
        { category: 'Financial', count: 8 },
        { category: 'Compliance', count: 15 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const kpiIcons = {
    total: {
      bg: 'bg-blue-50',
      svg: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    high: {
      bg: 'bg-red-50',
      svg: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    medium: {
      bg: 'bg-yellow-50',
      svg: (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    low: {
      bg: 'bg-green-50',
      svg: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#1B4F8A]">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Real-time risk metrics and oversight</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 bg-white px-4 min-h-[44px] rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition font-semibold text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-sm flex items-center">
            <svg className="w-5 h-5 text-amber-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-700 font-medium">{error}</p>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total Risks" value={stats.total} color="text-gray-900" icon={kpiIcons.total} trend={+12} />
          <KPICard title="Critical Issues" value={stats.high} color="text-red-600" icon={kpiIcons.high} trend={-5} />
          <KPICard title="Action Required" value={stats.medium} color="text-yellow-600" icon={kpiIcons.medium} trend={+8} />
          <KPICard title="Stable Items" value={stats.low} color="text-green-600" icon={kpiIcons.low} trend={+15} />
        </div>

        {/* Chart Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Risk Distribution</h2>
              <p className="text-gray-500 text-sm font-medium">Categorized analysis of organizational risks</p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-widest">Live View</span>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Bar 
                  dataKey="count" 
                  name="Risk Count"
                  radius={[8, 8, 0, 0]} 
                  barSize={50}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}