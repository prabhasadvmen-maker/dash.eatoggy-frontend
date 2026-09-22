import API_BASE_URL from '../apiService.js';

/**
 * Customer Restaurant & Menu Discovery API Service
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('customer_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getDiscoveryRestaurants = async () => {
  const response = await fetch(`${API_BASE_URL}/api/customers/discovery/restaurants`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getDiscoveryRestaurantById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/discovery/restaurants/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getDiscoveryRestaurantMenu = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/discovery/restaurants/${id}/menu`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const searchGlobalAPI = async (query) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/discovery/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getBannersAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/customers/discovery/banners`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getCollectionsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/customers/discovery/collections`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getGourmetCreationsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/customers/discovery/gourmet`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
