import axiosInstance from './axiosInstance';

export const menuService = {
  getCategories: (params) => axiosInstance.get('/categories', { params }),
  getDishes: (params) => axiosInstance.get('/dishes', { params }),
  getDish: (slug) => axiosInstance.get(`/dishes/${slug}`),
  getTrending: () => axiosInstance.get('/dishes/trending'),

  // Admin
  createDish: (formData) =>
    axiosInstance.post('/dishes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateDish: (id, formData) =>
    axiosInstance.patch(`/dishes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDish: (id) => axiosInstance.delete(`/dishes/${id}`),
  removeDishImage: (id, imageId) => axiosInstance.delete(`/dishes/${id}/images/${imageId}`),

  createCategory: (formData) =>
    axiosInstance.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCategory: (id, formData) =>
    axiosInstance.patch(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteCategory: (id) => axiosInstance.delete(`/categories/${id}`),
};
