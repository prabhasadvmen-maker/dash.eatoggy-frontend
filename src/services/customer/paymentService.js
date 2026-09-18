import API_BASE_URL from '../apiService.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('customer_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Initiate Razorpay Order Payment Order on Server
 */
export const createOrderPaymentAPI = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/api/payments/create-order-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ sessionId })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Verify Payment Signature and Idempotently Create Order
 */
export const verifyOrderPaymentAPI = async (paymentDetails) => {
  const response = await fetch(`${API_BASE_URL}/api/payments/verify-order-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentDetails)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
