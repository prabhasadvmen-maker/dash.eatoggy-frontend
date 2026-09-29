import axiosInstance from '../../utils/axiosConfig.js';

export const customerOrderService = {
  getOrders: (params) => axiosInstance.get('/api/customers/orders', { params }),
  getOrderById: (id) => axiosInstance.get(`/api/customers/orders/${id}`),
  cancelOrder: (orderId, reason) => axiosInstance.post(`/api/customers/orders/${orderId}/cancel`, { reason }),
};
