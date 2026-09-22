import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  Store,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const CustomerCart = () => {
  const navigate = useNavigate();
  const { cart, loading, actionLoading, error, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleDecreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      removeFromCart(item.menuItemId);
    } else {
      updateQuantity(item.menuItemId, item.quantity - 1);
    }
  };

  const handleIncreaseQuantity = (item) => {
    updateQuantity(item.menuItemId, item.quantity + 1);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#d4af37] mt-4 font-bold text-sm">Loading your box...</p>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-4">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
              data-testid="cart-back-btn"
            >
              <ArrowLeft size={18} className="text-gray-900" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#d4af37]" /> Your Box
              </h1>
              {cart?.restaurant && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  from <span className="text-gray-700 font-medium">{cart.restaurant.restaurantName}</span>
                </p>
              )}
            </div>
          </div>

          {!isEmpty && (
            <button
              onClick={clearCart}
              disabled={actionLoading}
              className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-colors cursor-pointer disabled:opacity-50"
              data-testid="clear-cart-btn"
            >
              <Trash2 size={14} /> Clear Box
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4" data-testid="cart-empty">
            <div className="w-24 h-24 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-xl">
              <UtensilsCrossed size={40} className="text-gray-300" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-900">Your Box is Empty</h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore restaurants and add your favourite meals.
              </p>
            </div>
            <button
              onClick={() => navigate('/user/home')}
              className="mt-2 px-6 py-3 bg-[#d4af37] text-slate-950 font-bold rounded-2xl shadow-lg hover:brightness-110 transition-colors cursor-pointer text-xs uppercase tracking-wider"
              data-testid="browse-menu-btn"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Restaurant Info Header */}
            {cart.restaurant && (
              <div 
                onClick={() => navigate(`/user/restaurant/${cart.restaurant._id}`)}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                    {cart.restaurant.image ? (
                      <img src={cart.restaurant.image} alt={cart.restaurant.restaurantName} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={22} className="text-[#d4af37]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{cart.restaurant.restaurantName}</h3>
                    <p className="text-xs text-gray-500">{cart.restaurant.cuisine || 'Cloud Kitchen'} • {cart.restaurant.city || 'Local'}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            )}

            {/* Cart Items List */}
            <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Selected Items ({cart.items.length})</h3>

              <div className="divide-y divide-slate-800/60">
                {cart.items.map((item) => (
                  <div key={item._id || item.menuItemId} className="py-3.5 flex items-center justify-between gap-3" data-testid="cart-item">
                    {/* Item Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-200/50 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <UtensilsCrossed size={18} className="text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span className="text-[#d4af37]">₹{item.price}</span> × {item.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Subtotal */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden p-0.5">
                        <button
                          onClick={() => handleDecreaseQuantity(item)}
                          disabled={actionLoading}
                          className="w-7 h-7 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          data-testid="decrease-qty-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-gray-900" data-testid="item-qty">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(item)}
                          disabled={actionLoading}
                          className="w-7 h-7 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          data-testid="increase-qty-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right min-w-[60px]">
                        <span className="text-sm font-black text-gray-900" data-testid="item-subtotal">₹{item.itemSubtotal}</span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        disabled={actionLoading}
                        className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1"
                        data-testid="remove-item-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Details Summary */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Bill Summary</h3>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Item Total (Subtotal)</span>
                <span className="font-black text-gray-900 text-base" data-testid="cart-total">₹{cart.subtotal}</span>
              </div>

              <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 text-[11px] text-gray-500 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>Delivery fees & taxes will be calculated at checkout step.</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('/user/checkout')}
                className="w-full py-3.5 bg-[#d4af37] text-slate-950 hover:brightness-110 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
                data-testid="checkout-btn"
              >
                Proceed to Checkout →
              </button>

              <button
                onClick={() => navigate('/user/home')}
                className="w-full py-3 bg-transparent text-gray-500 hover:text-gray-900 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Continue Browsing Meals
              </button>
            </div>
          </>
        )}
      </main>

      
    </div>
  );
};

export default CustomerCart;
