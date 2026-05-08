import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Signup form submitted:', formData);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-sm bg-[#ffffff] rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-5 shadow-lg shadow-indigo-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">Create Account</h2>
          <p className="text-[15px] font-medium text-slate-500 mt-2">Sign up for a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-[44px] px-[14px] bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus:bg-white hover:border-slate-300 transition-all duration-200 ease-out"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-[44px] px-[14px] bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus:bg-white hover:border-slate-300 transition-all duration-200 ease-out"
              placeholder="Enter your email"
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
              value={formData.password}
              onChange={handleChange}
              className="w-full h-[44px] px-[14px] bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus:bg-white hover:border-slate-300 transition-all duration-200 ease-out"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full h-[44px] px-[14px] bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus:bg-white hover:border-slate-300 transition-all duration-200 ease-out"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] bg-[linear-gradient(to_right,#1e293b,#0f172a)] text-white font-bold rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:brightness-110 hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:-translate-y-[2px] active:translate-y-[1px] active:scale-[0.98] transition-all duration-200 ease-out disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center shadow-none">
          <p className="text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
