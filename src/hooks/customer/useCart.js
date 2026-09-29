import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosConfig.js';
import { toast } from 'react-toastify';

const cartService = {
  getCart: () => axiosInstance.get('/api/cart'),
  addItem: (data) => axiosInstance.post('/api/cart/items', data),
  removeItem: (itemId) => axiosInstance.delete(`/api/cart/items/${itemId}`),
  updateQuantity: (itemId, quantity) => axiosInstance.patch(`/api/cart/items/${itemId}`, { quantity }),
  clearCart: () => axiosInstance.delete('/api/cart')
};

export const useCart = () => {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
  });

  const addItemMutation = useMutation({
    mutationFn: (data) => cartService.addItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Item added to cart');
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => cartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => cartService.updateQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  const cartData = cartQuery.data?.data || null;
  const items = cartData?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart: cartData,
    items,
    total: cartData?.pricing?.grandTotal || 0,
    itemCount,
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    clearCart: clearCartMutation.mutate,
    loading: cartQuery.isLoading || addItemMutation.isPending || updateQuantityMutation.isPending,
    error: cartQuery.error
  };
};
