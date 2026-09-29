import axiosInstance from '../../utils/axiosConfig.js';

export const checkoutService = {
  getCheckoutSummary: (params) => axiosInstance.get('/api/checkout/summary', { params }),
  initiateCheckout: (data) => axiosInstance.post('/api/checkout/initiate', data),
  verifyPayment: (data) => axiosInstance.post('/api/checkout/verify-payment', data),
};
