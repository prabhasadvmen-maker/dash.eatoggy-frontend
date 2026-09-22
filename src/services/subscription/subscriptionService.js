import API_BASE_URL from '../apiService.js';

const getCustomerAuthHeaders = () => {
  const token = localStorage.getItem('customer_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const getRestaurantAuthHeaders = () => {
  const token = localStorage.getItem('restaurant_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// ==========================================
// CUSTOMER TIFFIN & SUBSCRIPTION APIS
// ==========================================

export const getPublicTiffinPlansAPI = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams).toString();
  const url = `${API_BASE_URL}/api/customers/tiffin-plans${searchParams ? `?${searchParams}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getTiffinPlanByIdAPI = async (planId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/tiffin-plans/${planId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const createSubscriptionAPI = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions`, {
    method: 'POST',
    headers: getCustomerAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const verifySubscriptionPaymentAPI = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/verify-payment`, {
    method: 'POST',
    headers: getCustomerAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getMySubscriptionsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions`, {
    method: 'GET',
    headers: getCustomerAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getSubscriptionDetailAPI = async (subscriptionId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: getCustomerAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const pauseSubscriptionAPI = async (subscriptionId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/${subscriptionId}/pause`, {
    method: 'PATCH',
    headers: getCustomerAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const resumeSubscriptionAPI = async (subscriptionId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/${subscriptionId}/resume`, {
    method: 'PATCH',
    headers: getCustomerAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const cancelSubscriptionAPI = async (subscriptionId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/${subscriptionId}/cancel`, {
    method: 'PATCH',
    headers: getCustomerAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const skipOccurrenceAPI = async (subscriptionId, occurrenceId) => {
  const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/${subscriptionId}/occurrences/${occurrenceId}/skip`, {
    method: 'POST',
    headers: getCustomerAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

// ==========================================
// RESTAURANT TIFFIN PLAN MANAGEMENT APIS
// ==========================================

export const getRestaurantTiffinPlansAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/restaurants/tiffin-plans`, {
    method: 'GET',
    headers: getRestaurantAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const createRestaurantTiffinPlanAPI = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/restaurants/tiffin-plans`, {
    method: 'POST',
    headers: getRestaurantAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const updateRestaurantTiffinPlanAPI = async (planId, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/restaurants/tiffin-plans/${planId}`, {
    method: 'PATCH',
    headers: getRestaurantAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const toggleTiffinPlanStatusAPI = async (planId, isActive) => {
  const response = await fetch(`${API_BASE_URL}/api/restaurants/tiffin-plans/${planId}/status`, {
    method: 'PATCH',
    headers: getRestaurantAuthHeaders(),
    body: JSON.stringify({ isActive })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export default {
  getPublicTiffinPlansAPI,
  getTiffinPlanByIdAPI,
  createSubscriptionAPI,
  verifySubscriptionPaymentAPI,
  getMySubscriptionsAPI,
  getSubscriptionDetailAPI,
  pauseSubscriptionAPI,
  resumeSubscriptionAPI,
  cancelSubscriptionAPI,
  skipOccurrenceAPI,
  getRestaurantTiffinPlansAPI,
  createRestaurantTiffinPlanAPI,
  updateRestaurantTiffinPlanAPI,
  toggleTiffinPlanStatusAPI
};
