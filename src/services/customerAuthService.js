import API_BASE_URL from './apiService.js';

/**
 * Customer Authentication API Service
 */

export const customerSignup = async ({ name, mobile, email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/customer-auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mobile, email, password })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const customerSendOtp = async (mobile) => {
  const response = await fetch(`${API_BASE_URL}/api/customer-auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const customerVerifyOtp = async ({ mobile, otp }) => {
  const response = await fetch(`${API_BASE_URL}/api/customer-auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const customerLogin = async ({ mobile, email, password }) => {
  const payload = mobile ? { mobile, password } : { email, password };
  const response = await fetch(`${API_BASE_URL}/api/customer-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const customerGetMe = async () => {
  const token = localStorage.getItem('customer_token');
  if (!token) {
    return { status: 401, ok: false, data: { message: 'No authentication token found' } };
  }

  const response = await fetch(`${API_BASE_URL}/api/customer-auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const customerGetDashboard = async () => {
  const token = localStorage.getItem('customer_token');
  if (!token) {
    return { status: 401, ok: false, data: { message: 'No authentication token found' } };
  }

  const response = await fetch(`${API_BASE_URL}/api/customer-auth/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const customerSaveLocation = async ({ latitude, longitude, address, city, state, pincode, saveAsAddress = true }) => {
  const token = localStorage.getItem('customer_token');
  if (!token) {
    return { status: 401, ok: false, data: { message: 'No authentication token found' } };
  }

  const response = await fetch(`${API_BASE_URL}/api/customer-auth/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      latitude,
      longitude,
      address,
      city,
      state,
      pincode,
      saveAsAddress
    })
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
