import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3003/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vlb_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAttempt = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('vlb_token');
      localStorage.removeItem('vlb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);