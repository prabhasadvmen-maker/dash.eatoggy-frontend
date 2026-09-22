import API_BASE_URL from '../apiService';

const getSuperAdminHeaders = () => {
  const token = localStorage.getItem('superadmin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getOnboardingFeeSetting = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/super-admin/restaurant/onboarding-fee`, {
      method: 'GET',
      headers: getSuperAdminHeaders()
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const updateOnboardingFeeSetting = async (amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/super-admin/restaurant/onboarding-fee`, {
      method: 'PUT',
      headers: getSuperAdminHeaders(),
      body: JSON.stringify({ amount })
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};
