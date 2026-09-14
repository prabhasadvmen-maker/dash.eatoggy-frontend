import API_BASE_URL from '../apiService.js';

const getSuperAdminHeaders = () => {
  const token = localStorage.getItem('superadmin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getDeliveryPartners = async (status = '', search = '') => {
  const query = new URLSearchParams();
  if (status) query.append('status', status);
  if (search) query.append('search', search);

  const response = await fetch(`${API_BASE_URL}/api/super-admin/delivery-partners?${query.toString()}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getDeliveryPartnerById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/delivery-partners/${id}`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const approveDeliveryPartner = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/delivery-partners/${id}/approve`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const rejectDeliveryPartner = async (id, reason) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/delivery-partners/${id}/reject`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify({ reason })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const getOnboardingFeeSetting = async () => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/onboarding-fee`, {
    method: 'GET',
    headers: getSuperAdminHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const updateOnboardingFeeSetting = async (amount) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/onboarding-fee`, {
    method: 'PUT',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify({ amount })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
