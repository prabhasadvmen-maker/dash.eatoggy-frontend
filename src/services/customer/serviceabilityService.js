import axiosInstance from '../../utils/axiosConfig.js';

export const serviceabilityService = {
  checkServiceability: (lat, lng) => axiosInstance.get('/api/serviceability/check', { params: { lat, lng } }),
  getConfig: () => axiosInstance.get('/api/public/config'),
};
