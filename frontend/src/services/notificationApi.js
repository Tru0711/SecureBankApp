import api from './api';

export const notificationApi = {
  getNotifications: (params) => api.get('/notifications', { params }).then((res) => res.data),
  markAsRead: (notificationId) => api.put(`/notifications/read/${notificationId}`).then((res) => res.data),
  markAllRead: () => api.put('/notifications/read-all').then((res) => res.data),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`).then((res) => res.data)
};
