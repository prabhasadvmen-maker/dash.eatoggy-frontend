import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerOrderService } from '../../services/customer/customerOrderService.js';
import { toast } from 'react-toastify';

export const useOrders = (filters = {}) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['customerOrders', filters],
    queryFn: () => customerOrderService.getOrders(filters),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }) => customerOrderService.cancelOrder(orderId, reason),
    onSuccess: (res) => {
      toast.success(res.message || 'Order cancelled successfully');
      queryClient.invalidateQueries(['customerOrders']);
      queryClient.invalidateQueries(['customerOrder']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel order');
    }
  });

  return {
    orders: ordersQuery.data?.data || [],
    isLoading: ordersQuery.isLoading,
    cancelOrder: cancelOrderMutation.mutate,
    isCancelling: cancelOrderMutation.isPending
  };
};

export const useOrderDetails = (orderId) => {
  return useQuery({
    queryKey: ['customerOrder', orderId],
    queryFn: () => customerOrderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};
