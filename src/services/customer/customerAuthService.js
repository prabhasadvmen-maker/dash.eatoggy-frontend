import axiosInstance from '../../utils/axiosConfig.js';

export const customerAuthService = {
  getProfile: () => axiosInstance.get('/api/customer-auth/me'),
  updateProfile: (data) => axiosInstance.patch('/api/customer-auth/me', data),
  deleteAccount: (reason) => axiosInstance.delete('/api/customer-auth/account', { data: { reason } }),
  logout: () => axiosInstance.post('/api/customer-auth/logout'),
};
