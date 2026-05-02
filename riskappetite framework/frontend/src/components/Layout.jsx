import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                style={{ color: isActive('/') ? '#1B4F8A' : '#6B7280' }}
              >
                Dashboard
              </Link>
              <Link
                to="/risks"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                style={{ color: isActive('/risks') || location.pathname.startsWith('/risks') ? '#1B4F8A' : '#6B7280' }}
              >
                Risk Items
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                style={{ color: isActive('/analytics') ? '#1B4F8A' : '#6B7280' }}
              >
                Analytics
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.username || 'User'}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}