import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and desktop nav */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-orange-100 transition">
                <span className="text-2xl">📚</span>
                <span className="hidden sm:inline">Student Research Search</span>
                <span className="sm:hidden">SR Search</span>
              </Link>
              <div className="hidden md:flex ml-8 space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/') ? 'bg-orange-700 text-white' : 'text-orange-100 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  🔍 Search
                </Link>
                {user && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/admin') || location.pathname.startsWith('/admin/')
                        ? 'bg-orange-700 text-white'
                        : 'text-orange-100 hover:bg-orange-500 hover:text-white'
                    }`}
                  >
                    ⚙️ Admin
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop user menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-orange-100">
                    <UserCircleIcon className="h-5 w-5" />
                    <span className="text-sm">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-orange-800 hover:bg-orange-900 text-white px-3 py-1 rounded-md text-sm transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className={`text-orange-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/login') ? 'bg-orange-700' : ''
                  }`}
                >
                  Admin Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-orange-100 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-orange-700 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-orange-800 text-white' : 'text-orange-100 hover:bg-orange-600'
                }`}
              >
                🔍 Search
              </Link>
              {user && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname.startsWith('/admin') ? 'bg-orange-800 text-white' : 'text-orange-100 hover:bg-orange-600'
                  }`}
                >
                  ⚙️ Admin Dashboard
                </Link>
              )}
              {!user && (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-orange-100 hover:bg-orange-600"
                >
                  Admin Login
                </Link>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-orange-100 hover:bg-orange-600"
                >
                  Logout
                </button>
              )}
            </div>
            {user && (
              <div className="border-t border-orange-600 px-2 py-2">
                <div className="flex items-center gap-2 px-3 py-1 text-orange-100">
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="text-sm">{user.username}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Student Research Search Engine | Powered by IR Techniques (TF-IDF, Cosine Similarity)
          </p>
        </div>
      </footer>
    </div>
  );
}