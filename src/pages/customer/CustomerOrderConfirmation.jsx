import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerOrderByIdAPI } from '../../services/customer/orderService.js';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav.jsx';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  Receipt,
  Home
} from 'lucide-react';

const CustomerOrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCustomerOrderByIdAPI(id);
        if (res.ok && res.data.success) {
          setOrder(res.data.data);
        } else {
          setError(res.data.message || 'Failed to fetch order details');
        }
      } catch (err) {
        setError('Error loading order confirmation');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100" data-testid="order-confirmation-page">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#d4af37] mt-4 font-bold text-sm">Preparing your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 text-center" data-testid="order-confirmation-page">
        <UtensilsCrossed size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-white">Order Not Found</h2>
        <p className="text-slate-400 text-xs mb-6 max-w-sm">{error || 'Unable to locate order details'}</p>
        <button
          onClick={() => navigate('/user/home')}
          className="px-6 py-2.5 bg-[#d4af37] text-slate-950 font-bold rounded-xl text-xs uppercase"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const { orderNumber, restaurantId, items, deliveryAddress, pricing, orderStatus, paymentStatus, createdAt } = order;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-20" data-testid="order-confirmation-page">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={24} className="text-emerald-400" />
          <div>
            <h1 className="text-lg font-black text-white">Order Confirmed!</h1>
            <p className="text-xs text-slate-400">Order ID: <span className="text-[#d4af37] font-mono font-bold" data-testid="order-number">{orderNumber}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck size={16} />
          <span className="font-bold uppercase" data-testid="payment-status-badge">{paymentStatus}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-black text-white">Thank You for Your Order!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your payment was verified successfully and your order has been sent to <span className="text-[#d4af37] font-bold">{restaurantId?.restaurantName || 'the restaurant'}</span>.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/60 text-xs text-slate-300">
            <Clock size={14} className="text-[#d4af37]" />
            <span>Estimated Delivery: <strong className="text-white">30-40 Mins</strong></span>
          </div>
        </div>

        {/* Restaurant Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl" data-testid="restaurant-snapshot">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Store size={16} className="text-[#d4af37]" /> Restaurant Details
          </h3>
          <div className="flex items-center gap-3 pt-1">
            {restaurantId?.documents?.restaurantImage && (
              <img
                src={restaurantId.documents.restaurantImage}
                alt={restaurantId.restaurantName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-800"
              />
            )}
            <div>
              <p className="font-bold text-white text-sm" data-testid="restaurant-name">
                {restaurantId?.restaurantName || 'Cloud Kitchen Restaurant'}
              </p>
              <p className="text-xs text-slate-400">{restaurantId?.cuisine ? (Array.isArray(restaurantId.cuisine) ? restaurantId.cuisine.join(', ') : restaurantId.cuisine) : 'Cloud Kitchen'} • {restaurantId?.city || 'Delhi NCR'}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xl" data-testid="delivery-address">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MapPin size={16} className="text-[#d4af37]" /> Delivery Location
          </h3>
          <p className="font-bold text-white text-sm" data-testid="address-recipient">{deliveryAddress?.name}</p>
          <p className="text-xs text-slate-300" data-testid="address-full text">
            {deliveryAddress?.addressLine1}, {deliveryAddress?.addressLine2 ? `${deliveryAddress.addressLine2}, ` : ''}{deliveryAddress?.city} - {deliveryAddress?.pincode}
          </p>
          <p className="text-[11px] text-slate-400">Mobile: {deliveryAddress?.mobile}</p>
        </div>

        {/* Items Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl" data-testid="ordered-items-list">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#d4af37]" /> Ordered Items ({items.length})
            </h3>
            <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-[10px] font-bold rounded-full uppercase" data-testid="order-status-badge">
              {orderStatus}
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs" data-testid="order-item">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 rounded-sm ${item.foodType === 'VEG' ? 'border-emerald-500' : 'border-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.foodType === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-white truncate max-w-[200px]" data-testid="item-name">{item.foodNameSnapshot}</p>
                    <p className="text-[11px] text-slate-400">₹{item.unitPrice} x {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-white" data-testid="item-total">₹{item.itemTotal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audited Pricing Breakdown Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl" data-testid="pricing-summary">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Receipt size={16} className="text-[#d4af37]" /> Financial Breakdown
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Items Subtotal</span>
              <span className="font-bold text-white">₹{pricing?.itemSubtotal}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Packaging Charge</span>
              <span className="font-bold text-white">₹{pricing?.packagingFee}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Delivery Fee</span>
              <span className="font-bold text-white">{pricing?.deliveryFee === 0 ? 'FREE' : `₹${pricing?.deliveryFee}`}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Taxes (5% GST)</span>
              <span className="font-bold text-white">₹{pricing?.tax}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Platform Fee</span>
              <span className="font-bold text-white">₹{pricing?.platformFee}</span>
            </div>

            {pricing?.discount > 0 && (
              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>Discount Applied</span>
                <span>-₹{pricing?.discount}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base">
              <span className="font-black text-white">Grand Total Paid</span>
              <span className="font-black text-[#d4af37] text-lg" data-testid="order-grand-total">
                ₹{pricing?.grandTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => navigate(`/user/orders/${order._id}`)}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            data-testid="view-order-details-btn"
          >
            <Receipt size={14} /> View Details
          </button>
          <button
            onClick={() => navigate('/user/orders')}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            data-testid="my-orders-btn"
          >
            <ShoppingBag size={14} /> My Orders
          </button>
          <button
            onClick={() => navigate('/user/home')}
            className="py-3 bg-[#d4af37] hover:brightness-110 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
            data-testid="continue-shopping-btn"
          >
            <Home size={14} /> Continue Shopping
          </button>
        </div>
      </main>

      <CustomerBottomNav />
    </div>
  );
};

export default CustomerOrderConfirmation;
