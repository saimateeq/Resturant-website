import axiosInstance from './axiosInstance';

export const reservationService = {
  create: (payload) => axiosInstance.post('/reservations', payload),
  getMyReservations: () => axiosInstance.get('/reservations/my-reservations'),
  cancel: (id) => axiosInstance.patch(`/reservations/${id}/cancel`),

  // Admin
  listAll: (params) => axiosInstance.get('/reservations', { params }),
  updateStatus: (id, payload) => axiosInstance.patch(`/reservations/${id}/status`, payload),
  reschedule: (id, payload) => axiosInstance.patch(`/reservations/${id}/reschedule`, payload),
};
