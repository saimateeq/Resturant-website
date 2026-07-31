import axiosInstance from './axiosInstance';

export const couponService = {
  list: () => axiosInstance.get('/coupons'),
  create: (payload) => axiosInstance.post('/coupons', payload),
  update: (id, payload) => axiosInstance.patch(`/coupons/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/coupons/${id}`),
};
