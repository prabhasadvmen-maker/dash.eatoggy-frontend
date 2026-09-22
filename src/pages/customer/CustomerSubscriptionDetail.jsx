import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubscriptionDetailAPI, skipOccurrenceAPI, pauseSubscriptionAPI, resumeSubscriptionAPI, cancelSubscriptionAPI } from '../../services/subscription/subscriptionService.js';
import { subscribeToSubscriptionUpdates, unsubscribeFromSubscriptionUpdates } from '../../services/socketService.js';

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

  // Real-Time Socket.IO Subscription (Refetches timeline when occurrence is generated or status changes)
  useEffect(() => {
    if (!subscriptionId) return;

    subscribeToSubscriptionUpdates(subscriptionId, {
      onOccurrenceCreated: (data) => {
        console.log('[CustomerSubscriptionDetail] Socket event: subscription:occurrence:created', data);
        fetchDetail();
      },
      onSubscriptionUpdated: (data) => {
        console.log('[CustomerSubscriptionDetail] Socket event: subscription:updated', data);
        fetchDetail();
      }
    });

    return () => {
      unsubscribeFromSubscriptionUpdates(subscriptionId);
    };
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
        return 'bg-gray-50 text-gray-500 border-gray-200';
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
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#d4af37] font-bold mt-3">Loading subscription timeline...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <AlertCircle size={40} className="text-red-400 mb-2" />
        <p className="text-sm font-bold text-gray-900 mb-4">{error || 'Subscription not found'}</p>
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
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-5">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/user/subscriptions')}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
              data-testid="detail-back-btn"
            >
              <ArrowLeft size={18} className="text-gray-900" />
            </button>
            <div>
              <span className="text-[10px] font-mono text-[#d4af37] font-bold">{subscription.subscriptionNumber}</span>
              <h1 className="text-base font-black text-gray-900">{subscription.planSnapshot?.planName}</h1>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(subscription.status)}`} data-testid="subscription-status-badge">
            {subscription.status}
          </span>
        </div>
        {/* Action Controls */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#d4af37]" />
            <span className="text-xs font-bold text-gray-900">
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
          <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <Utensils size={14} /> Plan Summary
            </h3>
            <div className="space-y-1 text-xs text-gray-700">
              <p><span className="text-gray-500">Meal Type:</span> <strong className="text-gray-900">{subscription.planSnapshot?.mealType}</strong></p>
              <p><span className="text-gray-500">Duration:</span> <strong className="text-gray-900">{subscription.durationDays} Days</strong></p>
              <p><span className="text-gray-500">Price / Meal:</span> <strong className="text-[#d4af37]">₹{subscription.planSnapshot?.pricePerMeal}</strong></p>
              <p><span className="text-gray-500">Total Amount Paid:</span> <strong className="text-[#d4af37]">₹{subscription.pricingSnapshot?.grandTotal}</strong></p>
            </div>
            {subscription.planSnapshot?.items && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Included Menu:</p>
                <div className="flex flex-wrap gap-1">
                  {subscription.planSnapshot.items.map((it, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-transparent text-[10px] text-gray-700 rounded border border-gray-100">
                      {it.quantity}x {it.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} /> Delivery Address
            </h3>
            <div className="text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900">{subscription.deliveryAddressSnapshot?.addressType || 'Home'}</p>
              <p>{subscription.deliveryAddressSnapshot?.streetAddress || subscription.deliveryAddressSnapshot?.addressLine1}</p>
              <p>{subscription.deliveryAddressSnapshot?.city}, {subscription.deliveryAddressSnapshot?.pincode}</p>
            </div>
          </div>
        </div>

        {/* Scheduled Occurrences Timeline */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-[#d4af37]" />
              Scheduled Meal Timeline ({occurrences.length} Occurrences)
            </h3>
          </div>

          {occurrences.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No scheduled occurrences available.</p>
          ) : (
            <div className="space-y-3" data-testid="occurrences-timeline">
              {occurrences.map((occ) => {
                const dateStr = occ.scheduledDate
                  ? new Date(occ.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                  : occ.dateString;

                return (
                  <div
                    key={occ._id}
                    className="bg-transparent border border-gray-100/80 rounded-2xl p-4 flex items-center justify-between text-xs"
                    data-testid={`occurrence-item-${occ._id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#d4af37]" />
                        <span className="font-bold text-gray-900">{dateStr}</span>
                        <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getOccurrenceBadgeClass(occ.status)}`}>
                          {occ.status}
                        </span>
                      </div>
                      {occ.generatedOrderId && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
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

      
    </div>
  );
};

export default CustomerSubscriptionDetail;
