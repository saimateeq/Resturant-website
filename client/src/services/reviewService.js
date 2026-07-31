import axiosInstance from './axiosInstance';

export const reviewService = {
  getDishReviews: (dishId, params) => axiosInstance.get(`/reviews/dish/${dishId}`, { params }),
  createReview: (payload) => axiosInstance.post('/reviews', payload),
  likeReview: (id) => axiosInstance.post(`/reviews/${id}/like`),
  reportReview: (id) => axiosInstance.post(`/reviews/${id}/report`),
  listAll: (params) => axiosInstance.get('/reviews', { params }),
  reply: (id, text) => axiosInstance.patch(`/reviews/${id}/reply`, { text }),
  moderate: (id, isHidden) => axiosInstance.patch(`/reviews/${id}/moderate`, { isHidden }),
};
