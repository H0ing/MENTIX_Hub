import axios from 'axios';
import { showLoader, hideLoader } from '../components/shared/GlobalLoading';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

// ── Attach access token + show global loader on mutations ──────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.method !== 'get') showLoader();
  return config;
});

// ── Auto-refresh on 401 (with queue to prevent concurrent refresh) ────────────
const AUTH_ENDPOINTS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/resend-otp', '/verify-otp'];

api.interceptors.response.use(
  (res) => {
    hideLoader();
    return res;
  },
  async (error) => {
    const original = error.config;
    hideLoader();

    // Don't intercept auth endpoints — they handle their own errors
    if (AUTH_ENDPOINTS.some(endpoint => original.url?.includes(endpoint))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('no refresh token');
        const { data } = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
        localStorage.setItem('accessToken',  data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        processQueue(null, data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
