import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import SearchPage from './pages/SearchPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DocumentList from './components/DocumentList';
import UploadDocument from './components/UploadDocument';
import EditDocument from './components/EditDocument';
import IndexStats from './components/IndexStats';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center p-10">Loading...</div>;
  return user ? children : <Navigate to="/admin/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<SearchPage />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DocumentList />} />
          <Route path="upload" element={<UploadDocument />} />
          <Route path="edit/:id" element={<EditDocument />} />
          <Route path="stats" element={<IndexStats />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;