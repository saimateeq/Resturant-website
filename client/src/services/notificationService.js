import axiosInstance from './axiosInstance';

export const notificationService = {
  getMine: () => axiosInstance.get('/notifications'),
  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.patch('/notifications/read-all'),
};
