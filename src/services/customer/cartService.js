import API_BASE_URL from '../apiService.js';

/**
 * Customer Cart API Service
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('customer_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Get active customer cart
 */
export const getCartAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Add item to customer cart
 */
export const addToCartAPI = async (menuItemId, quantity = 1) => {
  const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ menuItemId, quantity })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Update item quantity in cart
 */
export const updateCartItemAPI = async (menuItemId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/api/cart/items/${menuItemId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Remove item from cart
 */
export const removeFromCartAPI = async (menuItemId) => {
  const response = await fetch(`${API_BASE_URL}/api/cart/items/${menuItemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Clear customer cart
 */
export const clearCartAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
