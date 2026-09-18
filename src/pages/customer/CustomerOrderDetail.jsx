import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerOrderByIdAPI } from '../../services/customer/orderService.js';
import { getCustomerOrderTracking } from '../../services/delivery/deliveryOrderService.js';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav.jsx';
import {
  ArrowLeft,
  Store,
  MapPin,
  ShoppingBag,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Bike,
  Smartphone,
  Navigation
} from 'lucide-react';

const CustomerOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderAndTracking();
  }, [id]);

  useEffect(() => {
    if (order && !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(order.orderStatus)) {
      const interval = setInterval(fetchTrackingData, 4000);
      return () => clearInterval(interval);
    }
  }, [order]);

  const fetchOrderAndTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerOrderByIdAPI(id);
      if (res.ok && res.data.success) {
        setOrder(res.data.data);
        fetchTrackingData();
      } else {
        setError(res.data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      setError('Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingData = async () => {
    try {
      const trackingRes = await getCustomerOrderTracking(id);
      if (trackingRes.success) {
        setTracking(trackingRes.data);
      }
    } catch (err) {
      console.error('Tracking info unavailable:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100" data-testid="customer-order-detail-page">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#d4af37] mt-4 font-bold text-sm">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 text-center" data-testid="customer-order-detail-page">
        <AlertCircle size={48} className="text-red-500 mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2 text-white">Order Details Error</h2>
        <p className="text-slate-400 text-xs mb-6 max-w-sm">{error || 'Unable to load order details'}</p>
        <button
          onClick={() => navigate('/user/orders')}
          className="px-6 py-2.5 bg-[#d4af37] text-slate-950 font-bold rounded-xl text-xs uppercase"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const { orderNumber, restaurantId, items, deliveryAddress, pricing, orderStatus, statusHistory, rejectionReason } = order;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-20" data-testid="customer-order-detail-page">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user/orders')}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
            data-testid="order-detail-back-btn"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Order Summary</h1>
            <p className="text-xs text-slate-400">Order ID: <span className="text-[#d4af37] font-mono font-bold" data-testid="order-number">{orderNumber}</span></p>
          </div>
        </div>

        <span className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-bold rounded-xl uppercase" data-testid="order-status-badge">
          {orderStatus}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-4">
        {/* Rejection Notice if applicable */}
        {orderStatus === 'REJECTED' && rejectionReason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-4 space-y-1 text-xs text-red-400">
            <p className="font-bold flex items-center gap-1.5"><AlertCircle size={16} /> Order Rejected by Restaurant</p>
            <p className="text-slate-300">Reason: {rejectionReason}</p>
          </div>
        )}

        {/* DELIVERY OTP DISPLAY CARD */}
        {tracking?.deliveryOtp && orderStatus !== 'DELIVERED' && orderStatus !== 'REJECTED' && orderStatus !== 'CANCELLED' && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border-2 border-[#d4af37] rounded-3xl p-5 space-y-2 shadow-2xl" id="delivery-otp-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <ShieldCheck size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">DELIVERY VERIFICATION OTP</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] rounded-md uppercase">REQUIRED FOR HANDOFF</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-3xl font-mono font-black text-white tracking-widest" id="delivery-otp-value">{tracking.deliveryOtp}</p>
                <p className="text-[11px] text-slate-300 mt-1">Share this 4-digit code with your delivery partner upon arrival.</p>
              </div>
            </div>
          </div>
        )}

        {/* RIDER & LIVE TRACKING CARD */}
        {tracking?.partnerInfo && (
          <div className="bg-slate-900 border border-[#d4af37]/40 rounded-3xl p-5 space-y-3 shadow-xl" id="delivery-partner-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bike size={16} className="text-[#d4af37]" /> Delivery Partner Information
              </h3>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold uppercase" id="rider-delivery-status">
                {tracking.deliveryStatus}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="font-bold text-white text-sm" id="rider-name">{tracking.partnerInfo.fullName}</p>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <Smartphone size={12} className="text-slate-500" />
                  <span id="rider-mobile">{tracking.partnerInfo.mobile}</span>
                  <span>•</span>
                  <span className="text-[#d4af37] font-semibold">{tracking.partnerInfo.vehicleType}</span>
                </p>
              </div>
            </div>

            {/* Live GPS Coordinates Indicator */}
            {tracking.currentLocation && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Navigation size={14} className="text-[#d4af37] animate-pulse" />
                  <span>Live GPS Position</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400" id="rider-gps-coordinates">
                  {tracking.currentLocation.latitude?.toFixed(4)}, {tracking.currentLocation.longitude?.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Restaurant Section */}
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
              <p className="text-xs text-slate-400">{restaurantId?.city || 'Delhi NCR'}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xl" data-testid="delivery-address">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MapPin size={16} className="text-[#d4af37]" /> Delivery Location
          </h3>
          <p className="font-bold text-white text-sm" data-testid="address-recipient">{deliveryAddress?.name}</p>
          <p className="text-xs text-slate-300">
            {deliveryAddress?.addressLine1}, {deliveryAddress?.addressLine2 ? `${deliveryAddress.addressLine2}, ` : ''}{deliveryAddress?.city} - {deliveryAddress?.pincode}
          </p>
          <p className="text-[11px] text-slate-400">Mobile: {deliveryAddress?.mobile}</p>
        </div>

        {/* Ordered Item Snapshots */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl" data-testid="ordered-items-list">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShoppingBag size={16} className="text-[#d4af37]" /> Ordered Items ({items.length})
          </h3>

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

        {/* Audited Financial Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl" data-testid="pricing-summary">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Receipt size={16} className="text-[#d4af37]" /> Audited Bill Breakdown
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
                <span>Discount</span>
                <span>-₹{pricing?.discount}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base">
              <span className="font-black text-white">Grand Total</span>
              <span className="font-black text-[#d4af37] text-lg" data-testid="order-grand-total">
                ₹{pricing?.grandTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        {statusHistory && statusHistory.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl" data-testid="status-timeline">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock size={16} className="text-[#d4af37]" /> Order Status Timeline
            </h3>

            <div className="space-y-3 pt-1">
              {statusHistory.map((evt, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37] ring-4 ring-[#d4af37]/20" />
                    {idx < statusHistory.length - 1 && <div className="w-0.5 h-full bg-slate-800 my-1" />}
                  </div>
                  <div className="pb-1">
                    <p className="font-bold text-white uppercase">{evt.status}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {evt.note || evt.updatedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
};

export default CustomerOrderDetail;
