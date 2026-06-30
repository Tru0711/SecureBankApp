import api from './api';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard').then((res) => res.data),
  getUsers: (params) => api.get('/admin/users', { params }).then((res) => res.data),
  getUserDetails: (id) => api.get(`/admin/users/${id}`).then((res) => res.data),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`).then((res) => res.data),
  rejectUser: (id, reason) => api.put(`/admin/users/${id}/reject`, { reason }).then((res) => res.data),
  freezeUser: (id) => api.put(`/admin/users/${id}/freeze`).then((res) => res.data),
  unfreezeUser: (id) => api.put(`/admin/users/${id}/unfreeze`).then((res) => res.data),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }).then((res) => res.data),
  forceLogoutUser: (id) => api.put(`/admin/users/${id}/force-logout`).then((res) => res.data),
  resetUserPassword: (id, password) => api.put(`/admin/users/${id}/reset-password`, password ? { password } : {}).then((res) => res.data),

  getTransactions: (params) => api.get('/admin/transactions', { params }).then((res) => res.data),
  getFraudAlerts: (params) => api.get('/admin/fraud-alerts', { params }).then((res) => res.data),
  getKycQueue: () => api.get('/admin/kyc').then((res) => res.data),
  reviewKyc: (id, payload) => api.put(`/admin/kyc/${id}/review`, payload).then((res) => res.data),
  getTickets: (params) => api.get('/admin/tickets', { params }).then((res) => res.data),
  getTicketDetails: (id) => api.get(`/admin/tickets/${id}`).then((res) => res.data),
  replyTicket: (id, payload) => api.post(`/admin/tickets/${id}/replies`, payload).then((res) => res.data),
  updateTicket: (id, payload) => api.put(`/admin/tickets/${id}`, payload).then((res) => res.data),
  assignTicket: (id, payload) => api.put(`/admin/tickets/${id}/assign`, payload).then((res) => res.data),
  getAuditLogs: () => api.get('/admin/audit-logs').then((res) => res.data),
  getActivityLogs: () => api.get('/admin/activity-logs').then((res) => res.data)
};
