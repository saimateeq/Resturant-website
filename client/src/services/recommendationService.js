import axiosInstance from './axiosInstance';

export const recommendationService = {
  getForYou: () => axiosInstance.get('/recommendations/for-you'),
  getFrequentlyOrdered: () => axiosInstance.get('/recommendations/frequently-ordered'),
  getSearchSuggestions: (q) => axiosInstance.get('/recommendations/search-suggestions', { params: { q } }),
  getDietaryRecommendations: (diet) => axiosInstance.get('/recommendations/dietary', { params: { diet } }),
};
