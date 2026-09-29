import axiosInstance from '../../utils/axiosConfig.js';

export const offerService = {
  getOffers: () => axiosInstance.get('/api/offers'),
  applyCoupon: (couponCode) => axiosInstance.post('/api/offers/apply-coupon', { couponCode }),
};
