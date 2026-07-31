import axiosInstance from './axiosInstance';

export const analyticsService = {
  getSummary: () => axiosInstance.get('/analytics/summary'),
  getRevenue: (period) => axiosInstance.get('/analytics/revenue', { params: { period } }),
  getOrderStatusBreakdown: () => axiosInstance.get('/analytics/order-status'),
  getPopularDishes: () => axiosInstance.get('/analytics/popular-dishes'),
};
