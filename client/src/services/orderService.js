import axiosInstance from './axiosInstance';

export const orderService = {
  createOrder: (payload) => axiosInstance.post('/orders', payload),
  getMyOrders: (params) => axiosInstance.get('/orders/my-orders', { params }),
  getOrder: (id) => axiosInstance.get(`/orders/${id}`),
  cancelOrder: (id) => axiosInstance.patch(`/orders/${id}/cancel`),
  validateCoupon: (code, subtotal) => axiosInstance.post('/coupons/validate', { code, subtotal }),

  // Admin
  listAllOrders: (params) => axiosInstance.get('/orders', { params }),
  updateOrderStatus: (id, payload) => axiosInstance.patch(`/orders/${id}/status`, payload),
};
