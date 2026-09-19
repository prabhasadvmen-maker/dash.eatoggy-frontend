import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubscriptionDetailAPI, skipOccurrenceAPI, pauseSubscriptionAPI, resumeSubscriptionAPI, cancelSubscriptionAPI } from '../../services/subscription/subscriptionService.js';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav.jsx';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  SkipForward,
  Utensils,
  Receipt,
  Building2,
  Tag
} from 'lucide-react';

const CustomerSubscriptionDetail = () => {
  const { id: subscriptionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [subscriptionId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSubscriptionDetailAPI(subscriptionId);
      if (res.ok && res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.message || 'Failed to load subscription details');
      }
    } catch (err) {
      setError('Error loading subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setActionLoading(true);
      const res = await pauseSubscriptionAPI(subscriptionId);
      if (res.ok && res.data.success) {
        fetchDetail();
      } else {
        alert(res.data.message || 'Failed to pause subscription');
      }
    } catch (err) {
      alert('Error pausing subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      const res = await resumeSubscriptionAPI(subscriptionId);
      if (res.ok && res.data.success) {
        fetchDetail();
      } else {
        alert(res.data.message || 'Failed to resume subscription');
      }
    } catch (err) {
      alert('Error resuming subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      setActionLoading(true);
      const res = await cancelSubscriptionAPI(subscriptionId);
      if (res.ok && res.data.success) {
        fetchDetail();
      } else {
        alert(res.data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      alert('Error cancelling subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipOccurrence = async (occId) => {
    if (!window.confirm('Are you sure you want to skip this scheduled meal?')) return;
    try {
      setActionLoading(true);
      const res = await skipOccurrenceAPI(subscriptionId, occId);
      if (res.ok && res.data.success) {
        fetchDetail();
      } else {
        alert(res.data.message || 'Failed to skip meal occurrence');
      }
    } catch (err) {
      alert('Error skipping occurrence');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PAUSED':
        return 'bg-amber-500/10 text-[#d4af37] border-amber-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getOccurrenceBadgeClass = (status) => {
    switch (status) {
      case 'GENERATED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SCHEDULED':
        return 'bg-amber-500/10 text-[#d4af37] border-amber-500/30';
      case 'SKIPPED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100" data-testid="subscription-detail-loading">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#d4af37] font-bold mt-3">Loading subscription timeline...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <AlertCircle size={40} className="text-red-400 mb-2" />
        <p className="text-sm font-bold text-white mb-4">{error || 'Subscription not found'}</p>
        <button
          onClick={() => navigate('/user/subscriptions')}
          className="px-4 py-2 bg-[#d4af37] text-slate-950 font-bold rounded-xl text-xs"
        >
          Back to My Subscriptions
        </button>
      </div>
    );
  }

  const { subscription, occurrences = [] } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-20" data-testid="customer-subscription-detail-page">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user/subscriptions')}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
            data-testid="detail-back-btn"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <span className="text-[10px] font-mono text-[#d4af37] font-bold">{subscription.subscriptionNumber}</span>
            <h1 className="text-base font-black text-white">{subscription.planSnapshot?.planName}</h1>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(subscription.status)}`} data-testid="subscription-status-badge">
          {subscription.status}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-5">
        {/* Action Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#d4af37]" />
            <span className="text-xs font-bold text-white">
              {subscription.restaurantId?.restaurantName || 'Restaurant'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {subscription.status === 'ACTIVE' && (
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-[#d4af37] text-xs font-bold rounded-xl hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                data-testid="detail-pause-btn"
              >
                <Pause size={12} /> Pause
              </button>
            )}

            {subscription.status === 'PAUSED' && (
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1"
                data-testid="detail-resume-btn"
              >
                <Play size={12} /> Resume
              </button>
            )}

            {(subscription.status === 'ACTIVE' || subscription.status === 'PAUSED') && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 cursor-pointer flex items-center gap-1"
                data-testid="detail-cancel-btn"
              >
                <XCircle size={12} /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Subscription Info & Address Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plan Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <Utensils size={14} /> Plan Summary
            </h3>
            <div className="space-y-1 text-xs text-slate-300">
              <p><span className="text-slate-400">Meal Type:</span> <strong className="text-white">{subscription.planSnapshot?.mealType}</strong></p>
              <p><span className="text-slate-400">Duration:</span> <strong className="text-white">{subscription.durationDays} Days</strong></p>
              <p><span className="text-slate-400">Price / Meal:</span> <strong className="text-[#d4af37]">₹{subscription.planSnapshot?.pricePerMeal}</strong></p>
              <p><span className="text-slate-400">Total Amount Paid:</span> <strong className="text-[#d4af37]">₹{subscription.pricingSnapshot?.grandTotal}</strong></p>
            </div>
            {subscription.planSnapshot?.items && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Included Menu:</p>
                <div className="flex flex-wrap gap-1">
                  {subscription.planSnapshot.items.map((it, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-950 text-[10px] text-slate-300 rounded border border-slate-800">
                      {it.quantity}x {it.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} /> Delivery Address
            </h3>
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">{subscription.deliveryAddressSnapshot?.addressType || 'Home'}</p>
              <p>{subscription.deliveryAddressSnapshot?.streetAddress || subscription.deliveryAddressSnapshot?.addressLine1}</p>
              <p>{subscription.deliveryAddressSnapshot?.city}, {subscription.deliveryAddressSnapshot?.pincode}</p>
            </div>
          </div>
        </div>

        {/* Scheduled Occurrences Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar size={16} className="text-[#d4af37]" />
              Scheduled Meal Timeline ({occurrences.length} Occurrences)
            </h3>
          </div>

          {occurrences.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No scheduled occurrences available.</p>
          ) : (
            <div className="space-y-3" data-testid="occurrences-timeline">
              {occurrences.map((occ) => {
                const dateStr = occ.scheduledDate
                  ? new Date(occ.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                  : occ.dateString;

                return (
                  <div
                    key={occ._id}
                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs"
                    data-testid={`occurrence-item-${occ._id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#d4af37]" />
                        <span className="font-bold text-white">{dateStr}</span>
                        <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getOccurrenceBadgeClass(occ.status)}`}>
                          {occ.status}
                        </span>
                      </div>
                      {occ.generatedOrderId && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          Order ID: {occ.generatedOrderId._id || occ.generatedOrderId}
                        </p>
                      )}
                    </div>

                    <div>
                      {occ.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleSkipOccurrence(occ._id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-500/20 cursor-pointer flex items-center gap-1"
                          data-testid={`skip-occ-btn-${occ._id}`}
                        >
                          <SkipForward size={12} /> Skip Meal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <CustomerBottomNav />
    </div>
  );
};

export default CustomerSubscriptionDetail;
