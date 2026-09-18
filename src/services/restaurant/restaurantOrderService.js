import API_BASE_URL from '../apiService.js';
import { getRestaurantHeaders } from './restaurantAuthService.js';

/**
 * Get Restaurant Orders List (with optional status filter)
 */
export const getRestaurantOrdersAPI = async (status = null) => {
  const headers = await getRestaurantHeaders();
  const queryParam = status && status !== 'ALL' ? `?status=${status}` : '';
  const response = await fetch(`${API_BASE_URL}/api/restaurant-admin/orders${queryParam}`, {
    method: 'GET',
    headers
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Get Single Restaurant Order Details
 */
export const getRestaurantOrderByIdAPI = async (orderId) => {
  const headers = await getRestaurantHeaders();
  const response = await fetch(`${API_BASE_URL}/api/restaurant-admin/orders/${orderId}`, {
    method: 'GET',
    headers
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

/**
 * Update Restaurant Order Status
 */
export const updateRestaurantOrderStatusAPI = async (orderId, newStatus, reason = '') => {
  const headers = await getRestaurantHeaders();
  const response = await fetch(`${API_BASE_URL}/api/restaurant-admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: newStatus, reason })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
