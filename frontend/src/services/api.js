// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Interceptor to add the key to every request
api.interceptors.request.use(
  (config) => {
    const key = localStorage.getItem('adminKey');
    if (key) {
      config.headers['X-Admin-API-Key'] = key;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to log out on 403 (Invalid Key)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Invalid key, log out
      localStorage.removeItem('adminKey');
      window.location.href = '/login'; // Force reload to login page
    }
    return Promise.reject(error);
  }
);

export default api;