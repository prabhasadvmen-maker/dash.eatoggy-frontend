import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { offerService } from '../../services/customer/offerService.js';
import { toast } from 'react-toastify';

export const useOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => offerService.getOffers(),
  });
};

export const useCoupon = () => {
  const queryClient = useQueryClient();

  const applyCouponMutation = useMutation({
    mutationFn: (couponCode) => offerService.applyCoupon(couponCode),
    onSuccess: (res) => {
      toast.success(res.message || 'Coupon applied!');
      // Assuming you have a checkout summary or cart query to invalidate
      queryClient.invalidateQueries(['checkoutSummary']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to apply coupon');
    }
  });

  return {
    applyCoupon: applyCouponMutation.mutateAsync,
    isApplying: applyCouponMutation.isPending
  };
};
