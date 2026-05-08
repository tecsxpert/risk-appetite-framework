import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-sm bg-[#ffffff] rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-5 shadow-lg shadow-indigo-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">Risk Appetite</h2>
          <p className="text-[15px] font-medium text-slate-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-[44px] px-[14px] bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus:bg-white hover:border-slate-300 transition-all duration-200 ease-out"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[44px] px-[14px] bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus:bg-white hover:border-slate-300 transition-all duration-200 ease-out"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1 pb-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="w-[18px] h-[18px] rounded-[6px] border-slate-300 text-[#1B4F8A] focus:ring-[#1B4F8A]/30 cursor-pointer transition-all duration-200 ease-out" />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors duration-200">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] bg-[#1B4F8A] text-white font-bold rounded-[12px] shadow-[0_4px_10px_rgba(27,79,138,0.3)] hover:brightness-110 hover:shadow-[0_8px_20px_rgba(27,79,138,0.4)] hover:-translate-y-[2px] active:translate-y-[1px] active:scale-[0.98] transition-all duration-200 ease-out disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}