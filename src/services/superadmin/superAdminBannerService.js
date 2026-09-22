import API_BASE_URL from '../apiService.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('superadmin_token') || '';
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

export const superAdminGetBanners = async (params = '') => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/banners${params}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const superAdminGetBannerById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/banners/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const superAdminCreateBanner = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/banners`, {
    method: 'POST',
    headers: getAuthHeaders(), // Do NOT set Content-Type here, let fetch handle multipart boundary
    body: formData
  });
  return handleResponse(response);
};

export const superAdminUpdateBanner = async (id, formData) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/banners/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData
  });
  return handleResponse(response);
};

export const superAdminToggleBannerStatus = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/banners/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const superAdminDeleteBanner = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/banners/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
