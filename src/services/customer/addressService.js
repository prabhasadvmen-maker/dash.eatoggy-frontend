import API_BASE_URL from '../apiService.js';

/**
 * Customer Delivery Address API Service
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('customer_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Get all delivery addresses for logged in customer
 */
export const getAddressesAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/customers/addresses`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Add a new delivery address for customer
 */
export const addAddressAPI = async (addressData) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(addressData)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Delete a customer delivery address
 */
export const deleteAddressAPI = async (addressId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/addresses/${addressId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
