import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#1B4F8A] selection:text-white">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1B4F8A] to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:block">RiskAppetite</span>
              </div>
              <div className="hidden md:flex space-x-1">
                <Link
                  to="/"
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive('/') || isActive('/dashboard') ? 'bg-blue-50 text-[#1B4F8A]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/risks"
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive('/risks') || location.pathname.startsWith('/risks') ? 'bg-blue-50 text-[#1B4F8A]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Risk Items
                </Link>
                <Link
                  to="/analytics"
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive('/analytics') ? 'bg-blue-50 text-[#1B4F8A]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Analytics
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="w-6 h-6 bg-[#1B4F8A] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user?.username || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1.5 px-2 py-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-8 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
}