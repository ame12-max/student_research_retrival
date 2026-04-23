import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  ChartBarIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Documents', href: '/admin', icon: DocumentTextIcon },
    { name: 'Upload Document', href: '/admin/upload', icon: CloudArrowUpIcon },
    { name: 'Index Statistics', href: '/admin/stats', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <HomeIcon className="h-6 w-6 text-orange-500" />
              <span className="ml-2 text-lg font-semibold text-gray-800">Admin Console</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">👋 {user?.username}</span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-64 bg-white rounded-xl shadow-sm p-4 h-fit">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-orange-50 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 bg-white rounded-xl shadow-sm p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}