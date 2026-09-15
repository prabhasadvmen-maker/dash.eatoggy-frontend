import API_BASE_URL from '../apiService.js';

const getSuperAdminHeaders = () => {
  const token = localStorage.getItem('superadmin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ==========================================
// CATEGORY API
// ==========================================

export const getCategories = async (isActive = '', search = '') => {
  const query = new URLSearchParams();
  if (isActive !== '') query.append('isActive', isActive);
  if (search) query.append('search', search);

  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/categories?${query.toString()}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getCategoryById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/categories/${id}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const createCategory = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/categories`, {
    method: 'POST',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const updateCategory = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/categories/${id}`, {
    method: 'PUT',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const toggleCategoryStatus = async (id, isActive) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/categories/${id}/status`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify({ isActive })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

// ==========================================
// SUBCATEGORY API
// ==========================================

export const getSubcategories = async (categoryId = '', isActive = '', search = '') => {
  const query = new URLSearchParams();
  if (categoryId) query.append('categoryId', categoryId);
  if (isActive !== '') query.append('isActive', isActive);
  if (search) query.append('search', search);

  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/subcategories?${query.toString()}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getSubcategoryById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/subcategories/${id}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const createSubcategory = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/subcategories`, {
    method: 'POST',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const updateSubcategory = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/subcategories/${id}`, {
    method: 'PUT',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const toggleSubcategoryStatus = async (id, isActive) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/subcategories/${id}/status`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify({ isActive })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

// ==========================================
// MENU VERIFICATION API
// ==========================================

export const getPendingMenuItems = async (status = 'PENDING_REVIEW', restaurantId = '') => {
  const query = new URLSearchParams();
  if (status) query.append('status', status);
  if (restaurantId) query.append('restaurantId', restaurantId);

  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/verification/items?${query.toString()}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getMenuItemDetails = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/verification/items/${id}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const approveMenuItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/verification/items/${id}/approve`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const rejectMenuItem = async (id, rejectionReason) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/menu/verification/items/${id}/reject`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify({ rejectionReason })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
