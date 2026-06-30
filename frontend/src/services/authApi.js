import api from './api';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((res) => res.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((res) => res.data),
  sendOtp: (payload) => api.post('/auth/send-otp', payload).then((res) => res.data),
  resendOtp: (payload) => api.post('/auth/resend-otp', payload).then((res) => res.data),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload).then((res) => res.data),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload).then((res) => res.data),
  refreshToken: (payload) => api.post('/auth/refresh-token', payload).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data)
};
