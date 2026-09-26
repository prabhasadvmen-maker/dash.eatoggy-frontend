import API_BASE_URL from '../apiService.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token') || '';
  return {
    'Authorization': `Bearer ${token}`
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData = { success: false, message: 'An error occurred' };
    try {
      errorData = await response.json();
    } catch (e) {}
    throw errorData;
  }
  return response.json();
};

export const adminGetBanners = async (params = '') => {
  const response = await fetch(`${API_BASE_URL}/api/admins/banners${params}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const adminGetBannerById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/admins/banners/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const adminCreateBanner = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/admins/banners`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });
  return handleResponse(response);
};

export const adminUpdateBanner = async (id, formData) => {
  const response = await fetch(`${API_BASE_URL}/api/admins/banners/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData
  });
  return handleResponse(response);
};

export const adminToggleBannerStatus = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/admins/banners/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const adminDeleteBanner = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/admins/banners/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
