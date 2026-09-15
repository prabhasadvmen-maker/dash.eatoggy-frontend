import API_BASE_URL from '../apiService';

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('restaurant_token');
  const headers = {
    'Authorization': token ? `Bearer ${token}` : ''
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

export const updateBusinessDetails = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/business-details`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const uploadBusinessDocs = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/business-docs`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData // Fetch handles multipart boundary automatically
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const updateIdentityBank = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/identity-bank`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: formData
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const getRegistrationFee = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/registration-fee`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const getRazorpayKey = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/razorpay-key`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const createPaymentOrder = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/create-order`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/verify-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};

export const submitApplication = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurant-onboarding/submit`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const resData = await response.json();
    return { ok: response.ok, data: resData };
  } catch (error) {
    return { ok: false, data: { message: 'Network error.' } };
  }
};
