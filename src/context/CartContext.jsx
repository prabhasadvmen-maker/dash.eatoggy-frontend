import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCartAPI,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  clearCartAPI
} from '../services/customer/cartService.js';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, restaurantId: null, restaurant: null });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mismatchModal, setMismatchModal] = useState({ open: false, pendingItem: null, pendingQuantity: 1 });

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      setCart({ items: [], subtotal: 0, restaurantId: null, restaurant: null });
      return;
    }

    try {
      setLoading(true);
      const res = await getCartAPI();
      if (res.ok && res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (menuItemId, quantity = 1) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await addToCartAPI(menuItemId, quantity);

      if (res.ok && res.data.success) {
        setCart(res.data.data);
        return { success: true, cart: res.data.data };
      } else {
        if (res.data.code === 'DIFFERENT_RESTAURANT_CART' || res.status === 400 && res.data.message.includes('another restaurant')) {
          setMismatchModal({ open: true, pendingItem: menuItemId, pendingQuantity: quantity });
          return { success: false, isMismatch: true, message: res.data.message };
        }
        setError(res.data.message || 'Failed to add item to cart');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const msg = 'Network error adding to cart';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const updateQuantity = async (menuItemId, quantity) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await updateCartItemAPI(menuItemId, quantity);

      if (res.ok && res.data.success) {
        setCart(res.data.data);
        return { success: true, cart: res.data.data };
      } else {
        setError(res.data.message || 'Failed to update item quantity');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const msg = 'Network error updating quantity';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const removeFromCart = async (menuItemId) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await removeFromCartAPI(menuItemId);

      if (res.ok && res.data.success) {
        setCart(res.data.data);
        return { success: true, cart: res.data.data };
      } else {
        setError(res.data.message || 'Failed to remove item');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const msg = 'Network error removing item';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await clearCartAPI();

      if (res.ok && res.data.success) {
        setCart(res.data.data);
        return { success: true, cart: res.data.data };
      } else {
        setError(res.data.message || 'Failed to clear cart');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const msg = 'Network error clearing cart';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAndAddPending = async () => {
    const { pendingItem, pendingQuantity } = mismatchModal;
    setMismatchModal({ open: false, pendingItem: null, pendingQuantity: 1 });
    await clearCart();
    if (pendingItem) {
      await addToCart(pendingItem, pendingQuantity);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        actionLoading,
        error,
        itemCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}

      {/* Cross Restaurant Mismatch Modal */}
      {mismatchModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" data-testid="mismatch-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h3 className="text-lg font-bold text-white">Items from another restaurant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your box contains items from another restaurant. Would you like to clear your current box and add items from this restaurant instead?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setMismatchModal({ open: false, pendingItem: null, pendingQuantity: 1 })}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                data-testid="mismatch-cancel"
              >
                Keep Existing Box
              </button>
              <button
                onClick={handleClearAndAddPending}
                className="flex-1 py-2.5 bg-[#d4af37] hover:brightness-110 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                data-testid="mismatch-clear-and-add"
              >
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
