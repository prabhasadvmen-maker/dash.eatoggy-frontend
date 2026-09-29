import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAddressService } from '../../services/customer/customerAddressService.js';
import { toast } from 'react-toastify';

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: ['customerAddresses'],
    queryFn: () => customerAddressService.getAddresses(),
  });

  const addAddressMutation = useMutation({
    mutationFn: (data) => customerAddressService.addAddress(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Address added');
      queryClient.invalidateQueries(['customerAddresses']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add address');
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }) => customerAddressService.updateAddress(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Address updated');
      queryClient.invalidateQueries(['customerAddresses']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update address');
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => customerAddressService.deleteAddress(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Address deleted');
      queryClient.invalidateQueries(['customerAddresses']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete address');
    }
  });

  return {
    addresses: addressesQuery.data?.data || [],
    isLoading: addressesQuery.isLoading,
    addAddress: addAddressMutation.mutate,
    isAdding: addAddressMutation.isPending,
    updateAddress: updateAddressMutation.mutate,
    isUpdating: updateAddressMutation.isPending,
    deleteAddress: deleteAddressMutation.mutate,
    isDeleting: deleteAddressMutation.isPending,
  };
};
