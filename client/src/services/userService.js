import axiosInstance from './axiosInstance';

export const userService = {
  updateProfile: (formData) =>
    axiosInstance.patch('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (payload) => axiosInstance.patch('/users/change-password', payload),
  listAddresses: () => axiosInstance.get('/users/addresses'),
  addAddress: (payload) => axiosInstance.post('/users/addresses', payload),
  updateAddress: (id, payload) => axiosInstance.patch(`/users/addresses/${id}`, payload),
  deleteAddress: (id) => axiosInstance.delete(`/users/addresses/${id}`),
  getWishlist: () => axiosInstance.get('/users/wishlist'),
  toggleWishlist: (dishId) => axiosInstance.post(`/users/wishlist/${dishId}`),
};
