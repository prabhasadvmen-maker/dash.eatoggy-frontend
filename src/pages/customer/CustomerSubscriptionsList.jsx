import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySubscriptionsAPI, pauseSubscriptionAPI, resumeSubscriptionAPI, cancelSubscriptionAPI } from '../../services/subscription/subscriptionService.js';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav.jsx';
import {
  Calendar,
  ArrowLeft,
  Clock,
  Play,
  Pause,
  XCircle,
  ChevronRight,
  Sparkles,
  AlertCircle,
  UtensilsCrossed,
  CheckCircle2
} from 'lucide-react';

const CustomerSubscriptionsList = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMySubscriptionsAPI();
      if (res.ok && res.data.success) {
        setSubscriptions(res.data.data.subscriptions || []);
      } else {
        setError(res.data.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      setError('Error loading customer subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (e, subId) => {
    e.stopPropagation();
    try {
      setActionLoadingId(subId);
      const res = await pauseSubscriptionAPI(subId);
      if (res.ok && res.data.success) {
        fetchSubscriptions();
      } else {
        alert(res.data.message || 'Failed to pause subscription');
      }
    } catch (err) {
      alert('Error pausing subscription');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResume = async (e, subId) => {
    e.stopPropagation();
    try {
      setActionLoadingId(subId);
      const res = await resumeSubscriptionAPI(subId);
      if (res.ok && res.data.success) {
        fetchSubscriptions();
      } else {
        alert(res.data.message || 'Failed to resume subscription');
      }
    } catch (err) {
      alert('Error resuming subscription');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (e, subId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      setActionLoadingId(subId);
      const res = await cancelSubscriptionAPI(subId);
      if (res.ok && res.data.success) {
        fetchSubscriptions();
      } else {
        alert(res.data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      alert('Error cancelling subscription');
    } finally {
      setActionLoadingId(null);
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

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'ALL') return true;
    return sub.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-20" data-testid="customer-subscriptions-page">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user/home')}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
            data-testid="subscriptions-back-btn"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">My Subscriptions</h1>
            <p className="text-xs text-slate-400">Active & Past Tiffin Plans</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/user/tiffin-plans')}
          className="px-3 py-1.5 bg-[#d4af37] text-slate-950 font-bold rounded-full text-xs hover:brightness-110 transition-all cursor-pointer flex items-center gap-1"
          data-testid="explore-plans-btn"
        >
          <Sparkles size={14} />
          Explore Plans
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#d4af37] text-slate-950 shadow-md shadow-[#d4af37]/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#d4af37] font-bold">Loading your subscriptions...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 my-8 shadow-xl" data-testid="empty-subscriptions">
            <UtensilsCrossed size={48} className="text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">No Subscriptions Found</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Subscribe to daily fresh home-cooked meal plans from top restaurants!
              </p>
            </div>
            <button
              onClick={() => navigate('/user/tiffin-plans')}
              className="px-6 py-2.5 bg-[#d4af37] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
            >
              Browse Tiffin Plans
            </button>
          </div>
        ) : (
          <div className="space-y-3" data-testid="subscriptions-list">
            {filteredSubscriptions.map((sub) => {
              const formattedStartDate = sub.startDate
                ? new Date(sub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '';

              const isActionLoading = actionLoadingId === sub._id;

              return (
                <div
                  key={sub._id}
                  onClick={() => navigate(`/user/subscriptions/${sub._id}`)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 space-y-4 shadow-xl transition-all cursor-pointer group"
                  data-testid={`subscription-card-${sub._id}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div>
                      <span className="text-[11px] font-mono text-[#d4af37]" data-testid="subscription-number">
                        {sub.subscriptionNumber}
                      </span>
                      <h3 className="font-bold text-white text-base group-hover:text-[#d4af37] transition-colors" data-testid="subscription-plan-title">
                        {sub.planSnapshot?.planName || 'Tiffin Plan'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {sub.restaurantId?.restaurantName || 'Restaurant'}
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(sub.status)}`} data-testid="subscription-status-badge">
                      {sub.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Meal Type</p>
                      <p className="font-semibold text-white">{sub.planSnapshot?.mealType || 'LUNCH'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Duration</p>
                      <p className="font-semibold text-white">{sub.durationDays || 30} Days</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Start Date</p>
                      <p className="font-semibold text-white">{formattedStartDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Total Paid</p>
                      <p className="font-bold text-[#d4af37]">₹{sub.pricingSnapshot?.grandTotal || 0}</p>
                    </div>
                  </div>

                  {/* Actions & Detail CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {sub.status === 'ACTIVE' && (
                        <button
                          onClick={(e) => handlePause(e, sub._id)}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-[#d4af37] text-xs font-bold rounded-xl hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                          data-testid={`pause-btn-${sub._id}`}
                        >
                          <Pause size={12} /> Pause
                        </button>
                      )}

                      {sub.status === 'PAUSED' && (
                        <button
                          onClick={(e) => handleResume(e, sub._id)}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1"
                          data-testid={`resume-btn-${sub._id}`}
                        >
                          <Play size={12} /> Resume
                        </button>
                      )}

                      {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && (
                        <button
                          onClick={(e) => handleCancel(e, sub._id)}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 cursor-pointer flex items-center gap-1"
                          data-testid={`cancel-btn-${sub._id}`}
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#d4af37] font-bold group-hover:translate-x-1 transition-transform">
                      <span>View Timeline</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
};

export default CustomerSubscriptionsList;
