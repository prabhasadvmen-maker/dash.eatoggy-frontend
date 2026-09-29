import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerAuth } from './useCustomerAuth.js';
import axiosInstance from '../../utils/axiosConfig.js';
import { toast } from 'react-toastify';

export const useCustomerProfile = () => {
  const { profile, isLoadingProfile, updateProfile, deleteAccount, logout } = useCustomerAuth();
  const queryClient = useQueryClient();

  const changePasswordMutation = useMutation({
    mutationFn: (data) => axiosInstance.post('/api/customer-auth/change-password', data),
    onSuccess: (res) => {
      toast.success(res.message || 'Password changed successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to change password');
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (formData) => axiosInstance.post('/api/customer-auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      toast.success('Avatar updated');
      queryClient.invalidateQueries(['customerProfile']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to upload avatar');
    }
  });

  return {
    profile,
    loading: isLoadingProfile,
    updateProfile,
    uploadAvatar: uploadAvatarMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    deleteAccount,
    logout,
    error: null
  };
};
