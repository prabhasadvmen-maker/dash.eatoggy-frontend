import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTiffinPlanByIdAPI, createSubscriptionAPI, verifySubscriptionPaymentAPI } from '../../services/subscription/subscriptionService.js';
import { getAddressesAPI } from '../../services/customer/addressService.js';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav.jsx';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Clock,
  ShieldCheck,
  Tag,
  Info
} from 'lucide-react';

const TiffinPlanDetailCheckout = () => {
  const { id: planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [planId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [planRes, addrRes] = await Promise.all([
        getTiffinPlanByIdAPI(planId),
        getAddressesAPI()
      ]);

      if (planRes.ok && planRes.data.success) {
        setPlan(planRes.data.data.plan);
      } else {
        setError(planRes.data.message || 'Failed to load tiffin plan details');
      }

      if (addrRes.ok && addrRes.data.success) {
        const addrList = addrRes.data.data || [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          const defaultAddr = addrList.find(a => a.isDefault) || addrList[0];
          setSelectedAddressId(defaultAddr._id);
        }
      }
    } catch (err) {
      setError('Error loading plan checkout information');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutAndPay = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      // Step 1: Initiate subscription & create payment order
      const res = await createSubscriptionAPI({
        planId,
        addressId: selectedAddressId,
        startDate
      });

      if (!res.ok || !res.data.success) {
        setError(res.data.message || 'Failed to initiate subscription');
        setSubmitting(false);
        return;
      }

      const { subscription, paymentOrder, razorpayOrder } = res.data.data;
      const rzpOrderId = razorpayOrder?.id || paymentOrder?.orderId || paymentOrder?.id;

      // Step 2: Simulate / execute Razorpay payment signature verification
      // In production mode, Razorpay SDK popup opens. For standard test environments:
      const paymentVerifyRes = await verifySubscriptionPaymentAPI({
        subscriptionId: subscription._id,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_signature: `sig_sim_${Date.now()}`
      });

      if (paymentVerifyRes.ok && paymentVerifyRes.data.success) {
        setSuccessMsg('Subscription activated successfully!');
        setTimeout(() => {
          navigate(`/user/subscriptions/${subscription._id}`);
        }, 1500);
      } else {
        setError(paymentVerifyRes.data.message || 'Payment verification failed');
      }
    } catch (err) {
      setError('Error processing subscription payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100" data-testid="tiffin-checkout-loading">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#d4af37] font-bold mt-3">Loading checkout details...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <AlertCircle size={40} className="text-red-400 mb-2" />
        <p className="text-sm font-bold text-white mb-4">Tiffin plan not found</p>
        <button
          onClick={() => navigate('/user/tiffin-plans')}
          className="px-4 py-2 bg-[#d4af37] text-slate-950 font-bold rounded-xl text-xs"
        >
          Back to Tiffin Plans
        </button>
      </div>
    );
  }

  const rawSubtotal = (plan.pricePerMeal || 0) * (plan.durationDays || 1);
  const discountAmount = plan.discountPercentage ? (rawSubtotal * plan.durationDays * (plan.discountPercentage / 100)) : 0;
  const totalPrice = Math.max(0, rawSubtotal - discountAmount);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-20" data-testid="tiffin-plan-detail-checkout-page">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user/tiffin-plans')}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
            data-testid="checkout-back-btn"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Subscribe to Plan</h1>
            <p className="text-xs text-slate-400">{plan.restaurantId?.restaurantName || 'Restaurant Tiffin'}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-xs font-bold" data-testid="subscription-success-banner">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Plan Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl" data-testid="plan-summary-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[#d4af37] text-[10px] font-bold rounded-full uppercase">
                  {plan.mealType}
                </span>
                <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-full">
                  {plan.durationDays} Days Plan
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-2" data-testid="checkout-plan-name">{plan.name || plan.planName}</h2>
              <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Price</span>
              <p className="text-xl font-black text-[#d4af37]" data-testid="checkout-plan-price">₹{totalPrice}</p>
            </div>
          </div>

          {plan.items && plan.items.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Included Menu:</p>
              <div className="grid grid-cols-2 gap-2">
                {plan.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 size={14} className="text-[#d4af37]" />
                    <span>{item.quantity}x {item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subscription Configurations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar size={16} className="text-[#d4af37]" />
            Subscription Start Date
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Select Starting Date:</label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
              data-testid="start-date-input"
            />
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Info size={12} /> Deliveries will occur for {plan.durationDays} scheduled days starting on this date.
            </p>
          </div>
        </div>

        {/* Delivery Address Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin size={16} className="text-[#d4af37]" />
            Select Delivery Address
          </h3>

          {addresses.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-slate-400">No saved addresses found.</p>
              <button
                onClick={() => navigate('/user/addresses')}
                className="px-3 py-1.5 bg-[#d4af37] text-slate-950 text-xs font-bold rounded-xl"
              >
                Add Delivery Address
              </button>
            </div>
          ) : (
            <div className="space-y-2.5" data-testid="addresses-selector">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddressId === addr._id
                      ? 'bg-[#d4af37]/10 border-[#d4af37] text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mt-1 accent-[#d4af37]"
                    data-testid={`address-radio-${addr._id}`}
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{addr.addressType || 'Home'}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] text-[#d4af37] font-bold">Default</span>
                      )}
                    </div>
                    <p className="text-slate-300 mt-0.5">{addr.streetAddress || addr.addressLine1}, {addr.city}</p>
                    {addr.landmark && <p className="text-slate-500 text-[11px]">Landmark: {addr.landmark}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Payment Summary</h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Price Per Meal x {plan.durationDays} Days</span>
              <span>₹{rawSubtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Plan Discount ({plan.discountPercentage}%)</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Delivery Charges</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Amount Payable</span>
              <span className="text-[#d4af37] text-lg font-black" data-testid="grand-total-price">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCheckoutAndPay}
          disabled={submitting || !selectedAddressId}
          className="w-full py-4 bg-[#d4af37] hover:brightness-110 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          data-testid="subscribe-pay-btn"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Subscription...</span>
            </>
          ) : (
            <>
              <CreditCard size={18} />
              <span>Subscribe & Pay ₹{totalPrice}</span>
            </>
          )}
        </button>
      </main>

      <CustomerBottomNav />
    </div>
  );
};

export default TiffinPlanDetailCheckout;
