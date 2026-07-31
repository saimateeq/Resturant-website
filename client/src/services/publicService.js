import axiosInstance from './axiosInstance';

export const publicService = {
  subscribeNewsletter: (email) => axiosInstance.post('/newsletter/subscribe', { email }),
  submitContact: (payload) => axiosInstance.post('/contact', payload),
  getActiveOffers: () => axiosInstance.get('/offers'),
};
