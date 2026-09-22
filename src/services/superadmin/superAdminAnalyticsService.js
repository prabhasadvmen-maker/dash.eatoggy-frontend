const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchSuperAdminAnalytics = async () => {
  try {
    const token = localStorage.getItem('superadmin_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/super-admin/analytics/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch analytics data');
    }

    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, message: error.message };
  }
};
