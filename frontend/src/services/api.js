// frontend/src/services/api.js
import axios from 'axios';

// Use relative path for API (Vercel will proxy to Render)
const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const verifyToken = () => api.get('/auth/verify');

// Documents (admin)
export const getDocuments = () => api.get('/documents');
export const getDocument = (id) => api.get(`/documents/${id}`);
export const uploadDocument = (formData) => api.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateDocument = (id, formData) => api.put(`/documents/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Search (public)
export const search = (query, page = 1, limit = 10) => 
  api.post('/search', { query, page, limit });
export const getSuggestions = (prefix) => api.get(`/search/suggest?prefix=${prefix}`);
export const booleanSearch = (query, page = 1, limit = 10) => 
  api.post('/search/boolean', { query, page, limit });
export const relevanceFeedback = (originalQuery, relevantDocIds, alpha = 1.0, beta = 0.5) => 
  api.post('/search/feedback', { 
    originalQuery: originalQuery,
    relevantDocIds, 
    alpha, 
    beta 
  });

// Index (admin)
export const getIndexStats = () => api.get('/index/stats');
export const rebuildIndex = () => api.post('/index/rebuild');
