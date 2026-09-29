import axiosInstance from '../../utils/axiosConfig.js';

export const notificationService = {
  registerFCMToken: (data) => axiosInstance.post('/api/notifications/subscribe', data),
  getNotificationHistory: () => axiosInstance.get('/api/notifications/history'), // Mock endpoint or future use
};
