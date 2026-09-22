import API_BASE_URL from '../apiService.js';

/**
 * Customer Checkout API Service
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('customer_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Get server-calculated checkout summary & pricing breakdown
 */
export const getCheckoutSummaryAPI = async (addressId = null) => {
  const queryParam = addressId ? `?addressId=${addressId}` : '';
  const response = await fetch(`${API_BASE_URL}/api/checkout/summary${queryParam}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Initiate checkout session ready for payment
 */
export const initiateCheckoutAPI = async (addressId) => {
  const response = await fetch(`${API_BASE_URL}/api/checkout/initiate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ addressId })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
