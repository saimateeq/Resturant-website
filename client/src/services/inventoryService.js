import axiosInstance from './axiosInstance';

export const inventoryService = {
  list: (params) => axiosInstance.get('/inventory', { params }),
  create: (payload) => axiosInstance.post('/inventory', payload),
  update: (id, payload) => axiosInstance.patch(`/inventory/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/inventory/${id}`),
  recordPurchase: (id, payload) => axiosInstance.post(`/inventory/${id}/purchase`, payload),
};
