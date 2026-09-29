import API_BASE_URL from '../apiService';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
});

export const getOnboardingFeeSetting = async () => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/onboarding-fee`, { headers: getHeaders() });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const updateOnboardingFeeSetting = async (amount) => {
  const response = await fetch(`${API_BASE_URL}/api/super-admin/onboarding-fee`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ amount })
  });
  const data = await response.json();
  return { ok: response.ok, data };
};
