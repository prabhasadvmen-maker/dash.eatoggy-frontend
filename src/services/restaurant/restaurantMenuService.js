import { getRestaurantHeaders } from './restaurantAuthService';
import API_BASE_URL from '../apiService';

const API_URL = `${API_BASE_URL}/api/restaurants/menu`;

export const getMenuItems = async (params = '') => {
  const headers = await getRestaurantHeaders();
  const response = await fetch(`${API_URL}${params}`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch menu items');
  }
  return response.json();
};

export const getMenuItemById = async (id) => {
  const headers = await getRestaurantHeaders();
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch menu item details');
  }
  return response.json();
};

export const createMenuItem = async (formData) => {
  const headers = await getRestaurantHeaders();
  // Remove Content-Type for FormData so fetch sets it automatically with boundary
  const { 'Content-Type': _, ...headersWithoutContentType } = headers;
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: headersWithoutContentType,
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create menu item');
  }
  return response.json();
};

export const updateMenuItem = async (id, formData) => {
  const headers = await getRestaurantHeaders();
  const { 'Content-Type': _, ...headersWithoutContentType } = headers;

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: headersWithoutContentType,
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update menu item');
  }
  return response.json();
};

export const submitForVerification = async (id) => {
  const headers = await getRestaurantHeaders();
  const response = await fetch(`${API_URL}/${id}/submit`, {
    method: 'PATCH',
    headers,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit menu item');
  }
  return response.json();
};

export const toggleAvailability = async (id, availability) => {
  const headers = await getRestaurantHeaders();
  const response = await fetch(`${API_URL}/${id}/availability`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ availability }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle availability');
  }
  return response.json();
};

export const deleteDraft = async (id) => {
  const headers = await getRestaurantHeaders();
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete draft');
  }
  return response.json();
};
