import axiosInstance from './axiosInstance';

export const authService = {
  register: (payload) => axiosInstance.post('/auth/register', payload),
  verifyOtp: (payload) => axiosInstance.post('/auth/verify-otp', payload),
  resendOtp: (email) => axiosInstance.post('/auth/resend-otp', { email }),
  login: (payload) => axiosInstance.post('/auth/login', payload),
  googleLogin: (idToken) => axiosInstance.post('/auth/google', { idToken }),
  logout: () => axiosInstance.post('/auth/logout'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosInstance.post('/auth/reset-password', payload),
  getMe: () => axiosInstance.get('/auth/me'),
};
