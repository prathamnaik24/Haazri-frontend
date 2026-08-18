import axios from 'axios';

const api = axios.create({
  // Hardcoded to 5002 to bypass the outdated Docker container on 5000
  baseURL: 'http://localhost:5002/api',
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
