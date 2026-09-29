import { useMutation, useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/customer/notificationService.js';
import { toast } from 'react-toastify';

export const useNotifications = () => {
  const registerTokenMutation = useMutation({
    mutationFn: (data) => notificationService.registerFCMToken(data),
    onSuccess: () => {
      console.log('FCM Token registered with backend');
    },
    onError: (err) => {
      console.error('Failed to register FCM token', err);
    }
  });

  const historyQuery = useQuery({
    queryKey: ['notificationHistory'],
    queryFn: () => notificationService.getNotificationHistory(),
    enabled: false, // Set to true when backend actually supports it
  });

  return {
    registerToken: registerTokenMutation.mutate,
    isRegistering: registerTokenMutation.isPending,
    history: historyQuery.data?.data || [],
    isLoadingHistory: historyQuery.isLoading,
  };
};
