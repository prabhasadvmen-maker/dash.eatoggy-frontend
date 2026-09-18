import React, { useState, useEffect } from 'react';
import {
  getRestaurantOrdersAPI,
  updateRestaurantOrderStatusAPI
} from '../../services/restaurant/restaurantOrderService.js';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  User,
  MapPin,
  UtensilsCrossed,
  Phone,
  RotateCcw,
  Loader2,
  X
} from 'lucide-react';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  // Status updating state per orderId
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async (status = activeTab) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRestaurantOrdersAPI(status === 'ALL' ? null : status);
      if (res.ok && res.data.success) {
        setOrders(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch restaurant orders');
      }
    } catch (err) {
      setError('Network error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleStatusUpdate = async (orderId, newStatus, reason = '') => {
    try {
      setUpdatingId(orderId);
      setError(null);
      const res = await updateRestaurantOrderStatusAPI(orderId, newStatus, reason);
      if (res.ok && res.data.success) {
        // Refresh order list
        await fetchOrders(activeTab);
        if (showRejectModal) {
          setShowRejectModal(false);
          setSelectedOrder(null);
          setRejectionReason('');
        }
      } else {
        setError(res.data.message || 'Failed to update order status');
      }
    } catch (err) {
      setError('Error updating order status');
    } finally {
      setUpdatingId(null);
      setRejecting(false);
    }
  };

  const handleOpenRejectModal = (order) => {
    setSelectedOrder(order);
    setRejectionReason('');
    setRejectError(null);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason || rejectionReason.trim() === '') {
      setRejectError('Please enter a rejection reason.');
      return;
    }
    setRejecting(true);
    await handleStatusUpdate(selectedOrder._id, 'REJECTED', rejectionReason);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'PLACED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'ACCEPTED':
      case 'PREPARING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'READY':
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans" data-testid="restaurant-orders-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="text-[#d4af37]" /> Restaurant Order Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live Customer Orders & Kitchen Workflow</p>
        </div>

        <button
          onClick={() => fetchOrders(activeTab)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 self-start cursor-pointer border border-slate-700"
          data-testid="refresh-orders-btn"
        >
          <RotateCcw size={14} /> Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'PLACED', label: 'New (Placed)' },
          { key: 'ACCEPTED', label: 'Accepted' },
          { key: 'PREPARING', label: 'Preparing' },
          { key: 'READY', label: 'Ready' },
          { key: 'DELIVERED', label: 'Delivered' },
          { key: 'REJECTED', label: 'Rejected' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#d4af37] text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
            data-testid={`order-tab-${tab.key.toLowerCase()}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#d4af37] font-bold mt-4">Fetching restaurant orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-xl" data-testid="empty-restaurant-orders">
          <UtensilsCrossed size={48} className="text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are currently no orders under the selected filter tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
              data-testid="restaurant-order-card"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block" data-testid="order-number">{ord.orderNumber}</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5" data-testid="customer-name">
                      <User size={14} className="text-[#d4af37]" /> {ord.customerId?.fullName || 'Customer'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(ord.orderStatus)}`} data-testid="order-status-badge">
                    {ord.orderStatus}
                  </span>
                </div>

                {/* Customer Contact & Address Snapshot */}
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Phone size={12} className="text-[#d4af37]" />
                    <span>{ord.deliveryAddress?.mobile || ord.customerId?.mobile}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-300 text-xs">
                    <MapPin size={12} className="text-[#d4af37] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{ord.deliveryAddress?.addressLine1}, {ord.deliveryAddress?.city}</span>
                  </div>
                </div>

                {/* Items Snapshot */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Items ({ord.items.length})</p>
                  <div className="divide-y divide-slate-800/60 bg-slate-950/40 rounded-2xl p-2.5 border border-slate-800/80">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs" data-testid="order-item">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-[#d4af37]">{item.quantity}x</span>
                          <span className="font-medium text-white truncate max-w-[160px]">{item.foodNameSnapshot}</span>
                        </div>
                        <span className="font-bold text-slate-300">₹{item.itemTotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown Summary */}
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400 font-medium">Grand Total</span>
                  <span className="font-black text-[#d4af37] text-base" data-testid="order-grand-total">₹{ord.pricing?.grandTotal || 0}</span>
                </div>
              </div>

              {/* Action Buttons based on State Machine */}
              <div className="pt-3 border-t border-slate-800 flex gap-2">
                {ord.orderStatus === 'PLACED' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(ord._id, 'ACCEPTED')}
                      disabled={updatingId === ord._id}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      data-testid="accept-order-btn"
                    >
                      {updatingId === ord._id ? <Loader2 size={14} className="animate-spin" /> : 'Accept Order'}
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(ord)}
                      disabled={updatingId === ord._id}
                      className="py-2.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      data-testid="reject-order-btn"
                    >
                      Reject
                    </button>
                  </>
                )}

                {ord.orderStatus === 'ACCEPTED' && (
                  <button
                    onClick={() => handleStatusUpdate(ord._id, 'PREPARING')}
                    disabled={updatingId === ord._id}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    data-testid="start-preparing-btn"
                  >
                    {updatingId === ord._id ? <Loader2 size={14} className="animate-spin" /> : 'Start Preparing'}
                  </button>
                )}

                {ord.orderStatus === 'PREPARING' && (
                  <button
                    onClick={() => handleStatusUpdate(ord._id, 'READY')}
                    disabled={updatingId === ord._id}
                    className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    data-testid="mark-ready-btn"
                  >
                    {updatingId === ord._id ? <Loader2 size={14} className="animate-spin" /> : 'Mark Order Ready'}
                  </button>
                )}

                {ord.orderStatus === 'READY' && (
                  <button
                    onClick={() => handleStatusUpdate(ord._id, 'OUT_FOR_DELIVERY')}
                    disabled={updatingId === ord._id}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    data-testid="out-for-delivery-btn"
                  >
                    {updatingId === ord._id ? <Loader2 size={14} className="animate-spin" /> : 'Out for Delivery'}
                  </button>
                )}

                {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => handleStatusUpdate(ord._id, 'DELIVERED')}
                    disabled={updatingId === ord._id}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    data-testid="mark-delivered-btn"
                  >
                    {updatingId === ord._id ? <Loader2 size={14} className="animate-spin" /> : 'Mark Delivered'}
                  </button>
                )}

                {(ord.orderStatus === 'DELIVERED' || ord.orderStatus === 'REJECTED' || ord.orderStatus === 'CANCELLED') && (
                  <div className="w-full text-center py-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    Completed / Archived
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" data-testid="reject-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle size={18} className="text-red-400" /> Reject Customer Order
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {rejectError}
              </div>
            )}

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mandatory Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Item out of stock / Kitchen capacity full"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-red-500 focus:outline-none"
                  data-testid="rejection-reason-input"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1"
                  data-testid="confirm-reject-btn"
                >
                  {rejecting ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
