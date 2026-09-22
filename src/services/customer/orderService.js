import API_BASE_URL from '../apiService.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('customer_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Fetch Customer Orders History List
 */
export const getCustomerOrdersAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/customers/orders`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Fetch Single Customer Order Details
 */
export const getCustomerOrderByIdAPI = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/orders/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
