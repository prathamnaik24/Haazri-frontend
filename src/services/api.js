import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api',
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration & auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message || '';
      if (message.toLowerCase().includes('token') || message.toLowerCase().includes('expired') || message.toLowerCase().includes('unauthorized')) {
        // Clear token if expired/invalid and not already on auth page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && !window.location.pathname.includes('/accept-invite')) {
          localStorage.removeItem('token');
          // Smooth redirect to login
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
