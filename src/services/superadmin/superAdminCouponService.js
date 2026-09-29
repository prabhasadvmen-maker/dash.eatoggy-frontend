import API_BASE_URL from '../apiService';

const getHeaders = () => {
  const token = localStorage.getItem('superadmin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const fetchCoupons = async (params = '') => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/coupons?${params}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const createCoupon = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/coupons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const updateCoupon = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/coupons/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const deleteCoupon = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/coupons/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const toggleCouponStatus = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/coupons/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  const data = await response.json();
  return { ok: response.ok, data };
};
