import axiosInstance from './axiosInstance';

export const blogService = {
  getPosts: (params) => axiosInstance.get('/blog', { params }),
  getPost: (slug) => axiosInstance.get(`/blog/${slug}`),

  // Admin
  getAllPostsAdmin: () => axiosInstance.get('/blog/admin/all'),
  createPost: (formData) =>
    axiosInstance.post('/blog', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePost: (id, formData) =>
    axiosInstance.patch(`/blog/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePost: (id) => axiosInstance.delete(`/blog/${id}`),
};
