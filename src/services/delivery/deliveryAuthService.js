import API_BASE_URL from '../apiService.js';

export const deliverySendOtp = async (mobile) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery-auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const deliveryVerifyOtp = async ({ mobile, otp }) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery-auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};


export const deliveryGetMe = async () => {
  const token = localStorage.getItem('delivery_token');
  if (!token) {
    return { status: 401, ok: false, data: { message: 'No delivery partner token found' } };
  }

  const response = await fetch(`${API_BASE_URL}/api/delivery-auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
