import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

console.log('API Base URL:', BASE_URL);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased from 10000ms to 30000ms
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Ensure referrer policy is respected
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials so useProtectedRoute redirects cleanly.
      // Do NOT use window.location.href here — it causes a hard page freeze
      // mid-request. Navigation is handled by useProtectedRoute / page catch blocks.
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    // Log timeout errors for debugging
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend server may not be running at:', BASE_URL);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
