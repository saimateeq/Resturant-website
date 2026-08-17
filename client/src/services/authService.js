import axiosInstance from './axiosInstance';

export const authService = {
  register: (payload) => axiosInstance.post('/auth/register', payload),
  sendSignupOtp: (email) => axiosInstance.post('/auth/signup/otp', { email }),
  verifySignupOtp: (payload) => axiosInstance.post('/auth/signup/verify', payload),
  login: (payload) => axiosInstance.post('/auth/login', payload),
  googleLogin: (idToken) => axiosInstance.post('/auth/google', { idToken }),
  logout: () => axiosInstance.post('/auth/logout'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosInstance.post('/auth/reset-password', payload),
  getMe: () => axiosInstance.get('/auth/me'),
};
