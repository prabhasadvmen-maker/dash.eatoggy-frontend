import API_BASE_URL from '../apiService';

// Helper to get auth headers
export const getRestaurantHeaders = () => {
  const token = localStorage.getItem('restaurant_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const sendOtp = async (mobile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, data: { message: 'Network error. Please try again.' } };
  }
};

export const verifyOtp = async (mobile, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp })
    });
    const data = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem('restaurant_token', data.token);
    }
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, data: { message: 'Network error. Please try again.' } };
  }
};

export const getMe = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-auth/me`, {
      method: 'GET',
      headers: getRestaurantHeaders()
    });
    const data = await response.json();
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('restaurant_token');
    }
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, data: { message: 'Network error. Please try again.' } };
  }
};
