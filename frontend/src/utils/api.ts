import axios from 'axios';

const DEFAULT_API =
  process.env.NODE_ENV === 'production'
    ? 'https://kalchakra-backend.onrender.com/api'
    : 'http://localhost:5000/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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

export default api;
