import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerAuthService } from '../../services/customer/customerAuthService.js';
import { toast } from 'react-toastify';

export const useCustomerAuth = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => customerAuthService.getProfile(),
    retry: 1,
    onError: (error) => {
      console.error('Failed to fetch profile', error);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => customerAuthService.updateProfile(data),
    onSuccess: (data) => {
      toast.success(data.message || 'Profile updated successfully');
      queryClient.invalidateQueries(['customerProfile']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (reason) => customerAuthService.deleteAccount(reason),
    onSuccess: (data) => {
      toast.success(data.message || 'Account deletion scheduled');
      localStorage.removeItem('customerToken');
      window.location.href = '/login';
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete account');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => customerAuthService.logout(),
    onSuccess: (data) => {
      toast.success(data.message || 'Logged out successfully');
      localStorage.removeItem('customerToken');
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: (error) => {
      // Even on error, clear local state
      localStorage.removeItem('customerToken');
      queryClient.clear();
      window.location.href = '/login';
    }
  });

  return {
    profile: profileQuery.data?.data,
    isLoadingProfile: profileQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    deleteAccount: deleteAccountMutation.mutate,
    isDeletingAccount: deleteAccountMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
};
