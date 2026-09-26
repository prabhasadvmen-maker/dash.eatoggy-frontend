import React, { useState, useEffect, useMemo } from 'react';
import {
  getKitchenOrdersAPI,
  updateKitchenOrderStatusAPI
} from '../../services/restaurant/restaurantOrderService.js';
import { subscribeToKitchenOrders, unsubscribeFromKitchenOrders } from '../../services/socketService.js';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChefHat,
  RotateCcw,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Bell,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

const getRestaurantIdFromToken = () => {
  try {
    const userStr = localStorage.getItem('restaurant_user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      if (parsed.id || parsed._id) return parsed.id || parsed._id;
    }
    const token = localStorage.getItem('restaurant_token') || localStorage.getItem('restaurantToken');
    if (token) {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        const user = decoded.user || decoded.restaurant;
        if (user) return user.id || user._id;
      }
    }
  } catch (err) {
    console.error('Error decoding restaurant token:', err);
  }
  return null;
};

const KitchenKDS = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACCEPTED, PREPARING, READY
  const [updatingId, setUpdatingId] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Fetch restaurant identity for socket room subscription
  useEffect(() => {
    const rId = getRestaurantIdFromToken();
    if (rId) {
      setRestaurantId(rId);
    }
  }, []);

  // Update live clock every second for preparation timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async (status = activeTab) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getKitchenOrdersAPI(status === 'ALL' ? null : status);
      if (res.ok && res.data.success) {
        setOrders(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch kitchen orders queue');
      }
    } catch (err) {
      setError('Network error loading kitchen queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(activeTab);
  }, [activeTab]);

  // Socket.IO Real-time Kitchen Updates
  useEffect(() => {
    if (!restaurantId) return;

    subscribeToKitchenOrders(restaurantId, {
      onKitchenUpdate: (data) => {
        console.log('[KDS] Real-time status update received:', data);
        fetchQueue(activeTab);
      },
      onNewOrder: (data) => {
        console.log('[KDS] New incoming order received:', data);
        fetchQueue(activeTab);
      },
      onError: (err) => {
        console.error('[KDS] Socket room error:', err);
      }
    });

    return () => {
      unsubscribeFromKitchenOrders(restaurantId);
    };
  }, [restaurantId, activeTab]);

  const handleStatusUpdate = async (orderId, targetStatus) => {
    try {
      setUpdatingId(orderId);
      setError(null);
      const res = await updateKitchenOrderStatusAPI(orderId, targetStatus);
      if (res.ok && res.data.success) {
        await fetchQueue(activeTab);
      } else {
        setError(res.data.message || `Failed to update status to ${targetStatus}`);
      }
    } catch (err) {
      setError('Error updating kitchen order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Group orders into columns for KDS View
  const acceptedOrders = useMemo(() => orders.filter((o) => o.orderStatus === 'ACCEPTED'), [orders]);
  const preparingOrders = useMemo(() => orders.filter((o) => o.orderStatus === 'PREPARING'), [orders]);
  const readyOrders = useMemo(() => orders.filter((o) => o.orderStatus === 'READY'), [orders]);

  // Format Elapsed Time (hh:mm:ss)
  const formatTimer = (startTimestamp) => {
    if (!startTimestamp) return '00:00';
    const startMs = new Date(startTimestamp).getTime();
    if (isNaN(startMs)) return '00:00';

    const diffSeconds = Math.max(0, Math.floor((currentTime - startMs) / 1000));
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    const hrs = Math.floor(mins / 60);

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if prep time exceeded 20 minutes
  const isDelayedOrder = (startTimestamp) => {
    if (!startTimestamp) return false;
    const startMs = new Date(startTimestamp).getTime();
    if (isNaN(startMs)) return false;
    return currentTime - startMs > 20 * 60 * 1000;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-gray-900 font-sans min-h-screen bg-slate-50" data-testid="kitchen-kds-page">
      {/* Top KDS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#d4af37]/20 to-amber-600/20 border border-[#d4af37]/40 rounded-2xl">
              <ChefHat size={28} className="text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Kitchen Display System (KDS)
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Live Production Queue • Preparation Timers • Real-Time Orders</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Active Orders Summary Pills */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs">
            <span className="text-gray-500 font-medium">Active Queue:</span>
            <span className="font-bold text-[#d4af37]">{orders.length}</span>
            <span className="text-gray-400">|</span>
            <span className="text-[#d4af37] font-bold">{preparingOrders.length} In Prep</span>
            <span className="text-gray-400">|</span>
            <span className="text-purple-400 font-bold">{readyOrders.length} Ready</span>
          </div>

          <button
            onClick={() => fetchQueue(activeTab)}
            className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer border border-gray-200 transition-colors"
            data-testid="kds-refresh-btn"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { key: 'ALL', label: `All Kitchen Orders (${orders.length})` },
          { key: 'ACCEPTED', label: `Accepted / Queue (${acceptedOrders.length})` },
          { key: 'PREPARING', label: `In Prep (${preparingOrders.length})` },
          { key: 'READY', label: `Ready for Handoff (${readyOrders.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#1e1e2e] text-[#d4af37] shadow-md font-black'
                : 'bg-white text-gray-500 hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
            data-testid={`kds-tab-${tab.key.toLowerCase()}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between text-red-400 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchQueue(activeTab)}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#d4af37] font-bold mt-4">Loading kitchen display system queue...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center space-y-3 shadow-sm" data-testid="empty-kitchen-queue">
          <UtensilsCrossed size={52} className="text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No Orders in Kitchen Queue</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            All kitchen orders are up to date! New accepted customer orders will appear here in real-time.
          </p>
        </div>
      ) : activeTab === 'ALL' ? (
        /* KDS Multi-Column Dashboard Layout (Accepted -> Preparing -> Ready) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: ACCEPTED / QUEUE */}
          <div className="space-y-4" data-testid="kds-column-accepted">
            <div className="flex items-center justify-between bg-white border border-amber-500/30 p-3.5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Clock size={16} /> New Orders ({acceptedOrders.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md font-mono">STEP 1</span>
            </div>

            {acceptedOrders.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-300 rounded-2xl text-center text-gray-400 text-xs">
                No orders waiting to prep
              </div>
            ) : (
              acceptedOrders.map((ord) => <KDSCard key={ord._id} order={ord} onStatusUpdate={handleStatusUpdate} updatingId={updatingId} formatTimer={formatTimer} isDelayedOrder={isDelayedOrder} />)
            )}
          </div>

          {/* Column 2: PREPARING / IN PRODUCTION */}
          <div className="space-y-4" data-testid="kds-column-preparing">
            <div className="flex items-center justify-between bg-white border border-[#d4af37]/30 p-3.5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-2">
                <Flame size={16} /> In Production ({preparingOrders.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] rounded-md font-mono">STEP 2</span>
            </div>

            {preparingOrders.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-300 rounded-2xl text-center text-gray-400 text-xs">
                No orders currently in prep
              </div>
            ) : (
              preparingOrders.map((ord) => <KDSCard key={ord._id} order={ord} onStatusUpdate={handleStatusUpdate} updatingId={updatingId} formatTimer={formatTimer} isDelayedOrder={isDelayedOrder} />)
            )}
          </div>

          {/* Column 3: READY / HANDOFF */}
          <div className="space-y-4" data-testid="kds-column-ready">
            <div className="flex items-center justify-between bg-white border border-purple-500/30 p-3.5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <CheckCircle2 size={16} /> Ready for Pickup ({readyOrders.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md font-mono">STEP 3</span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-300 rounded-2xl text-center text-gray-400 text-xs">
                No orders ready for pickup
              </div>
            ) : (
              readyOrders.map((ord) => <KDSCard key={ord._id} order={ord} onStatusUpdate={handleStatusUpdate} updatingId={updatingId} formatTimer={formatTimer} isDelayedOrder={isDelayedOrder} />)
            )}
          </div>
        </div>
      ) : (
        /* Single Filtered Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((ord) => (
            <KDSCard key={ord._id} order={ord} onStatusUpdate={handleStatusUpdate} updatingId={updatingId} formatTimer={formatTimer} isDelayedOrder={isDelayedOrder} />
          ))}
        </div>
      )}
    </div>
  );
};

/* Individual Kitchen Order Card Component */
const KDSCard = ({ order, onStatusUpdate, updatingId, formatTimer, isDelayedOrder }) => {
  const { _id, orderNumber, items, orderStatus, createdAt, preparingAt, priority, customerId, preparationNotes } = order;

  const timerStart = preparingAt || createdAt;
  const timerStr = formatTimer(timerStart);
  const delayed = isDelayedOrder(timerStart);

  return (
    <div
      className={`bg-white border rounded-3xl p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between ${
        delayed
          ? 'border-amber-500/60 ring-2 ring-amber-500/20'
          : orderStatus === 'PREPARING'
          ? 'border-[#d4af37]/40'
          : orderStatus === 'READY'
          ? 'border-purple-500/40'
          : 'border-gray-200'
      }`}
      data-testid="kds-order-card"
    >
      <div className="space-y-3">
        {/* Header: Order #, Priority & Timer */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <span className="text-[11px] font-mono text-[#d4af37] font-bold block" data-testid="kds-order-number">{orderNumber}</span>
            <span className="text-[11px] text-gray-500 block mt-0.5">{new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-2">
            {priority && priority !== 'NORMAL' && (
              <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black rounded-md uppercase tracking-wider">
                {priority}
              </span>
            )}

            {/* Preparation Timer Badge */}
            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                delayed
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-slate-50 text-gray-700 border border-gray-200'
              }`}
              data-testid="prep-timer"
            >
              <Clock size={13} className={delayed ? 'text-amber-400' : 'text-[#d4af37]'} />
              <span>{timerStr}</span>
            </div>
          </div>
        </div>

        {/* Delayed Order Warning Banner */}
        {delayed && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0 text-amber-400" />
            <span>Preparation running over 20 minutes! Expedite order.</span>
          </div>
        )}

        {/* Ordered Item Checklist */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <span>Kitchen Preparation Items ({items.length})</span>
            <span>QTY</span>
          </div>

          <div className="divide-y divide-gray-100 bg-slate-50/60 rounded-2xl p-3 border border-gray-200 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between text-xs gap-2" data-testid="kds-item">
                <div className="flex items-start gap-2 min-w-0">
                  <div className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 rounded-sm shrink-0 mt-0.5 ${item.foodType === 'VEG' ? 'border-emerald-500' : 'border-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.foodType === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                  <span className="font-bold text-gray-900 text-sm leading-tight" data-testid="kds-item-name">{item.foodNameSnapshot}</span>
                </div>
                <span className="font-black text-[#d4af37] text-sm px-2 py-0.5 bg-[#d4af37]/10 rounded-lg shrink-0" data-testid="kds-item-qty">
                  {item.quantity}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions / Notes */}
        {preparationNotes && (
          <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-700">
            <span className="font-bold text-gray-500 text-[10px] uppercase block">Special Kitchen Note:</span>
            <span>{preparationNotes}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-gray-200">
        {orderStatus === 'ACCEPTED' && (
          <button
            onClick={() => onStatusUpdate(_id, 'PREPARING')}
            disabled={updatingId === _id}
            className="w-full py-3 bg-[#1e1e2e] hover:bg-black text-[#d4af37] font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-lg shadow-black/20"
            data-testid="start-prep-btn"
          >
            {updatingId === _id ? <Loader2 size={16} className="animate-spin" /> : <>Start Preparing <Flame size={16} /></>}
          </button>
        )}

        {orderStatus === 'PREPARING' && (
          <button
            onClick={() => onStatusUpdate(_id, 'READY')}
            disabled={updatingId === _id}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
            data-testid="mark-ready-btn"
          >
            {updatingId === _id ? <Loader2 size={16} className="animate-spin" /> : <>Mark Order Ready <CheckCircle2 size={16} /></>}
          </button>
        )}

        {orderStatus === 'READY' && (
          <div className="w-full py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2" data-testid="kds-ready-badge">
            <ShieldCheck size={16} /> Eligible for Rider Pickup
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenKDS;
