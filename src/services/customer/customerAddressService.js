import axiosInstance from '../../utils/axiosConfig.js';

export const customerAddressService = {
  getAddresses: () => axiosInstance.get('/api/customers/addresses'),
  addAddress: (data) => axiosInstance.post('/api/customers/addresses', data),
  updateAddress: (id, data) => axiosInstance.patch(`/api/customers/addresses/${id}`, data),
  deleteAddress: (id) => axiosInstance.delete(`/api/customers/addresses/${id}`),
};
