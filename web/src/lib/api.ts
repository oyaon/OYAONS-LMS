import axios from 'axios';
import { checkRateLimit } from './security';
import { getCsrfToken } from './security';
import { logAuditEvent } from './security';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for rate limiting and CSRF
api.interceptors.request.use(
  async (config) => {
    // Apply rate limiting
    if (import.meta.env.VITE_REACT_APP_ENABLE_RATE_LIMIT === 'true') {
      checkRateLimit();
    }

    // Add CSRF token
    if (import.meta.env.VITE_REACT_APP_ENABLE_CSRF === 'true') {
      const token = await getCsrfToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }

    // Log request for audit
    if (import.meta.env.VITE_REACT_APP_ENABLE_AUDIT_LOG === 'true') {
      logAuditEvent({
        action: 'API_REQUEST',
        details: {
          method: config.method,
          url: config.url,
          data: config.data,
        },
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and audit logging
api.interceptors.response.use(
  (response) => {
    // Log successful response for audit
    if (import.meta.env.VITE_REACT_APP_ENABLE_AUDIT_LOG === 'true') {
      logAuditEvent({
        action: 'API_RESPONSE',
        details: {
          status: response.status,
          url: response.config.url,
          data: response.data,
        },
      });
    }

    return response;
  },
  async (error) => {
    // Log error for audit
    if (import.meta.env.VITE_REACT_APP_ENABLE_AUDIT_LOG === 'true') {
      logAuditEvent({
        action: 'API_ERROR',
        details: {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        },
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const API = {
  // Auth endpoints
  auth: {
    login: (data: { email: string; password: string }) =>
      api.post('/api/auth/login', data),
    register: (data: { name: string; email: string; password: string }) =>
      api.post('/api/auth/register', data),
    refresh: () => api.post('/api/auth/refresh'),
    logout: () => api.post('/api/auth/logout'),
  },

  // Book endpoints
  books: {
    getAll: (params?: any) => api.get('/api/books', { params }),
    getById: (id: string) => api.get(`/api/books/${id}`),
    create: (data: any) => api.post('/api/books', data),
    update: (id: string, data: any) => api.put(`/api/books/${id}`, data),
    delete: (id: string) => api.delete(`/api/books/${id}`),
    export: (format: 'csv' | 'json') =>
      api.get(`/api/books/export/${format}`, { responseType: 'blob' }),
  },

  // Loan endpoints
  loans: {
    getAll: (params?: any) => api.get('/api/loans', { params }),
    getById: (id: string) => api.get(`/api/loans/${id}`),
    create: (data: any) => api.post('/api/loans', data),
    update: (id: string, data: any) => api.put(`/api/loans/${id}`, data),
    delete: (id: string) => api.delete(`/api/loans/${id}`),
    return: (id: string) => api.post(`/api/loans/${id}/return`),
  },

  // User endpoints
  users: {
    getAll: (params?: any) => api.get('/api/users', { params }),
    getById: (id: string) => api.get(`/api/users/${id}`),
    create: (data: any) => api.post('/api/users', data),
    update: (id: string, data: any) => api.put(`/api/users/${id}`, data),
    delete: (id: string) => api.delete(`/api/users/${id}`),
    updateRole: (id: string, role: string) =>
      api.put(`/api/users/${id}/role`, { role }),
  },

  // Report endpoints
  reports: {
    getAll: () => api.get('/api/reports'),
    getById: (id: string) => api.get(`/api/reports/${id}`),
    create: (data: any) => api.post('/api/reports', data),
    update: (id: string, data: any) => api.put(`/api/reports/${id}`, data),
    delete: (id: string) => api.delete(`/api/reports/${id}`),
    generate: (id: string) => api.post(`/api/reports/${id}/generate`),
  },
}; 