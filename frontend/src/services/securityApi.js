import api from './api';

export const securityApi = {
  getOverview: () => api.get('/users/security/overview').then((res) => res.data),
  createPin: (payload) => api.post('/users/security/transaction-pin', payload).then((res) => res.data),
  updatePin: (payload) => api.put('/users/security/transaction-pin', payload).then((res) => res.data),
  verifyPin: (payload) => api.post('/users/security/transaction-pin/verify', payload).then((res) => res.data),
  forgotPin: () => api.post('/users/security/transaction-pin/forgot').then((res) => res.data),
  resetPin: (payload) => api.post('/users/security/transaction-pin/reset', payload).then((res) => res.data),
  getSecurityLogs: () => api.get('/users/security/logs').then((res) => res.data),
  getLoginHistory: () => api.get('/users/security/login-history').then((res) => res.data),
  getDevices: () => api.get('/users/security/devices').then((res) => res.data),
  logoutDevice: (sessionId) => api.put(`/users/security/devices/${sessionId}/logout`).then((res) => res.data)
};
