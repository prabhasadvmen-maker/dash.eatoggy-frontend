import React, { useState } from 'react';
import { X, UtensilsCrossed, Clock, Star, ShieldCheck, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const CustomerFoodDetailModal = ({ item, restaurantName, onClose }) => {
  const { cart, addToCart, updateQuantity, removeFromCart, actionLoading } = useCart();

  if (!item) return null;

  const restName = item.restaurantId?.restaurantName || restaurantName || 'Cloud Kitchen';
  const cartItem = cart?.items?.find(ci => ci.menuItemId === item._id || ci.menuItemId?._id === item._id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const [localQty, setLocalQty] = useState(currentQty > 0 ? currentQty : 1);

  const handleAddToCart = () => {
    if (currentQty > 0) {
      updateQuantity(item._id, localQty);
    } else {
      addToCart(item._id, localQty);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" data-testid="food-detail-modal">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-slate-950/70 border border-slate-700/50 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          data-testid="close-food-detail"
        >
          <X size={18} />
        </button>

        {/* Hero Image */}
        <div className="h-56 sm:h-64 bg-slate-800 relative shrink-0 overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <UtensilsCrossed size={48} className="text-slate-700" />
            </div>
          )}

          {/* Veg/Non-Veg Badge */}
          {item.foodType && (
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-700 flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full border-2 ${item.foodType.toLowerCase() === 'veg' ? 'border-emerald-500 bg-emerald-500' : 'border-red-500 bg-red-500'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                {item.foodType.toUpperCase()}
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>

        {/* Details Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Header Row */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-semibold text-[#d4af37]">{restName}</span>
              {item.preparationTime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} className="text-[#d4af37]" /> {item.preparationTime} mins
                  </span>
                </>
              )}
            </div>

            <h2 className="text-2xl font-black text-white leading-tight" data-testid="food-name">
              {item.name}
            </h2>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-black text-[#d4af37]" data-testid="food-price">
                ₹{item.price}
              </span>
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-xs font-bold">
                <ShieldCheck size={12} />
                <span>Hygiene Verified</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Description</h4>
              <p className="text-slate-300 text-xs leading-relaxed" data-testid="food-description">
                {item.description}
              </p>
            </div>
          )}

          {/* Availability Status */}
          <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-800/50 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Availability</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available for Order
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-1">
            <button
              onClick={() => setLocalQty(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              data-testid="modal-decrease-qty"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-black text-sm text-white" data-testid="modal-qty-val">
              {localQty}
            </span>
            <button
              onClick={() => setLocalQty(prev => prev + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              data-testid="modal-increase-qty"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Box Button */}
          <button
            onClick={() => {
              handleAddToCart();
              onClose();
            }}
            disabled={actionLoading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-[#d4af37] text-slate-950 hover:brightness-110 px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            data-testid="modal-add-to-box-btn"
          >
            <ShoppingBag size={16} />
            <span>{currentQty > 0 ? `UPDATE BOX (₹${item.price * localQty})` : `ADD TO BOX • ₹${item.price * localQty}`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerFoodDetailModal;
