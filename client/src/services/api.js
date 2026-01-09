import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Posts API
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  updateMetrics: (id, data) => api.put(`/posts/${id}/metrics`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  getStats: () => api.get('/posts/stats/overview')
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getPostingTimes: () => api.get('/analytics/posting-times'),
  getGrowthTrends: () => api.get('/analytics/growth-trends'),
  generate: (data) => api.post('/analytics/generate', data)
};

// AI API
export const aiAPI = {
  analyzePost: (id) => api.post(`/ai/analyze-post/${id}`),
  analyzeNew: (data) => api.post('/ai/analyze-new', data),
  getTrendingInsights: () => api.get('/ai/trending-insights'),
  getPerformanceReport: (params) => api.get('/ai/performance-report', { params }),
  batchAnalyze: (postIds) => api.post('/ai/batch-analyze', { postIds }),
  getContentIdeas: (params) => api.get('/ai/content-ideas', { params })
};

export default api;
