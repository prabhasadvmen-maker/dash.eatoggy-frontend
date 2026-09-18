import API_BASE_URL from '../apiService.js';

const getHeaders = (tokenKey = 'deliveryToken') => {
  const token = localStorage.getItem('delivery_token') || localStorage.getItem(tokenKey) || localStorage.getItem('customerToken') || localStorage.getItem('customer_token') || localStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getAvailableJobs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/jobs/available`, {
    method: 'GET',
    headers: getHeaders('deliveryToken')
  });
  return await response.json();
};

export const getActiveJob = async () => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/jobs/active`, {
    method: 'GET',
    headers: getHeaders('deliveryToken')
  });
  return await response.json();
};

export const acceptJob = async (deliveryId) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/jobs/${deliveryId}/accept`, {
    method: 'POST',
    headers: getHeaders('deliveryToken')
  });
  return await response.json();
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/jobs/${deliveryId}/status`, {
    method: 'PATCH',
    headers: getHeaders('deliveryToken'),
    body: JSON.stringify({ status })
  });
  return await response.json();
};

export const updateDeliveryLocation = async (deliveryId, latitude, longitude) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/jobs/${deliveryId}/location`, {
    method: 'PATCH',
    headers: getHeaders('deliveryToken'),
    body: JSON.stringify({ latitude, longitude })
  });
  return await response.json();
};

export const verifyOtpAndComplete = async (deliveryId, otp) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/jobs/${deliveryId}/verify-otp`, {
    method: 'POST',
    headers: getHeaders('deliveryToken'),
    body: JSON.stringify({ otp })
  });
  return await response.json();
};

export const getCustomerOrderTracking = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/orders/tracking/${orderId}`, {
    method: 'GET',
    headers: getHeaders('customerToken')
  });
  return await response.json();
};
