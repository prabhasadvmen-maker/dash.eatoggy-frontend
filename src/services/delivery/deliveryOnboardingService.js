import API_BASE_URL from '../apiService.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('delivery_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getOnboardingFee = async () => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/fee`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const updateLocation = async (locationData) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/location`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(locationData)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const uploadDocuments = async (formData) => {
  const token = localStorage.getItem('delivery_token');
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: Content-Type is omitted so browser/fetch automatically sets multipart/form-data boundary
    },
    body: formData
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const updateBank = async (bankData) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/bank`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bankData)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const createPaymentOrder = async () => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/create-payment-order`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const verifyPayment = async (paymentData) => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/verify-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData)
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const submitOnboarding = async () => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/submit`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

export const resubmitOnboarding = async () => {
  const response = await fetch(`${API_BASE_URL}/api/delivery/onboarding/resubmit`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};
