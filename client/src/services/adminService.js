import axiosInstance from './axiosInstance';

export const adminService = {
  // Customers
  listCustomers: (params) => axiosInstance.get('/customers', { params }),
  getCustomer: (id) => axiosInstance.get(`/customers/${id}`),
  setCustomerBlockedStatus: (id, isBlocked) =>
    axiosInstance.patch(`/customers/${id}/block-status`, { isBlocked }),
  adjustRewardPoints: (id, points) => axiosInstance.patch(`/customers/${id}/reward-points`, { points }),

  // Staff
  listStaff: () => axiosInstance.get('/staff'),
  createStaff: (payload) => axiosInstance.post('/staff', payload),
  updateStaffRole: (id, role) => axiosInstance.patch(`/staff/${id}/role`, { role }),
  removeStaff: (id) => axiosInstance.delete(`/staff/${id}`),
};
