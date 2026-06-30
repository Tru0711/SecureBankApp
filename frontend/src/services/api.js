import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const publicAuthPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/send-otp',
    '/auth/resend-otp',
    '/auth/verify-otp',
    '/auth/refresh-token'
  ];

  if (publicAuthPaths.includes(config.url)) {
    return config;
  }

  const stored = localStorage.getItem('securepay_auth');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed?.accessToken) {
      config.headers.Authorization = `Bearer ${parsed.accessToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error?.config?.url?.includes('/auth/login');
    if (error?.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('securepay_auth');
      const loginPath = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
