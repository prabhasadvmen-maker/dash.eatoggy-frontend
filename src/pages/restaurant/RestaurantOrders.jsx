import React, { useState, useEffect, useCallback } from 'react';
import {
  getRestaurantOrdersAPI,
  updateRestaurantOrderStatusAPI
} from '../../services/restaurant/restaurantOrderService.js';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  RotateCcw,
  Loader2,
  X
} from 'lucide-react';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const RestaurantOrders = () => {
  const {
    page, setPage,
    limit, setLimit,
    search, setSearch,
    sortBy, sortOrder, setSort,
    filters, setFilters,
    handleClearFilters
  } = useDataTableSync({
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc'
  });

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  // Status updating state per orderId
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });
      
      if (search) queryParams.append('search', search);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
          queryParams.append(key, value);
        }
      });

      const res = await getRestaurantOrdersAPI(`?${queryParams.toString()}`);
      if (res.ok && res.data.success) {
        setOrders(res.data.data);
        if (res.data.meta && res.data.meta.pagination) {
          setTotal(res.data.meta.pagination.total);
        } else {
          setTotal(res.data.data.length);
        }
      } else {
        setError(res.data.message || 'Failed to fetch restaurant orders');
        setOrders([]);
        setTotal(0);
      }
    } catch (err) {
      setError('Network error fetching orders');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus, reason = '') => {
    try {
      setUpdatingId(orderId);
      setError(null);
      const res = await updateRestaurantOrderStatusAPI(orderId, newStatus, reason);
      if (res.ok && res.data.success) {
        await fetchOrders();
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
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-[#d4af37] font-bold" data-testid="order-number">
          {row.orderNumber}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer Details',
      sortable: false,
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5" data-testid="customer-name">
            <User size={12} className="text-[#d4af37]" /> {row.customerId?.fullName || 'Customer'}
          </p>
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] mt-1">
            <Phone size={10} className="text-[#d4af37]" />
            <span>{row.deliveryAddress?.mobile || row.customerId?.mobile}</span>
          </div>
          <div className="flex items-start gap-1.5 text-gray-500 text-[10px] mt-0.5">
            <MapPin size={10} className="text-[#d4af37] shrink-0 mt-0.5" />
            <span className="line-clamp-1 max-w-[200px]">{row.deliveryAddress?.addressLine1}, {row.deliveryAddress?.city}</span>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      sortable: false,
      render: (row) => (
        <div className="max-w-[200px]">
          <p className="text-[10px] font-bold text-gray-500 mb-1">{row.items.length} item(s)</p>
          {row.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-700 truncate">
              <span className="font-bold text-[#d4af37]">{item.quantity}x</span>
              <span className="truncate">{item.foodNameSnapshot}</span>
            </div>
          ))}
          {row.items.length > 2 && (
            <p className="text-[9px] text-gray-400 mt-0.5">+{row.items.length - 2} more</p>
          )}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-400 text-xs">
          ₹{row.pricing?.grandTotal || 0}
        </span>
      )
    },
    {
      key: 'orderStatus',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(row.orderStatus)}`} data-testid="order-status-badge">
          {row.orderStatus}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex flex-col gap-1 items-end min-w-[120px]">
          {row.orderStatus === 'PLACED' && (
            <>
              <button
                onClick={() => handleStatusUpdate(row._id, 'ACCEPTED')}
                disabled={updatingId === row._id}
                className="w-full py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {updatingId === row._id ? <Loader2 size={12} className="animate-spin" /> : 'Accept'}
              </button>
              <button
                onClick={() => handleOpenRejectModal(row)}
                disabled={updatingId === row._id}
                className="w-full py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            </>
          )}

          {row.orderStatus === 'ACCEPTED' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'PREPARING')}
              disabled={updatingId === row._id}
              className="w-full py-1.5 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {updatingId === row._id ? <Loader2 size={12} className="animate-spin" /> : 'Prepare'}
            </button>
          )}

          {row.orderStatus === 'PREPARING' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'READY')}
              disabled={updatingId === row._id}
              className="w-full py-1.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {updatingId === row._id ? <Loader2 size={12} className="animate-spin" /> : 'Mark Ready'}
            </button>
          )}

          {row.orderStatus === 'READY' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'OUT_FOR_DELIVERY')}
              disabled={updatingId === row._id}
              className="w-full py-1.5 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {updatingId === row._id ? <Loader2 size={12} className="animate-spin" /> : 'Out for Delivery'}
            </button>
          )}

          {row.orderStatus === 'OUT_FOR_DELIVERY' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'DELIVERED')}
              disabled={updatingId === row._id}
              className="w-full py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {updatingId === row._id ? <Loader2 size={12} className="animate-spin" /> : 'Mark Delivered'}
            </button>
          )}

          {(row.orderStatus === 'DELIVERED' || row.orderStatus === 'REJECTED' || row.orderStatus === 'CANCELLED') && (
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              Completed
            </span>
          )}
        </div>
      )
    }
  ];

  const filterConfig = [
    {
      key: 'orderStatus',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Orders', value: 'ALL' },
        { label: 'Placed', value: 'PLACED' },
        { label: 'Accepted', value: 'ACCEPTED' },
        { label: 'Preparing', value: 'PREPARING' },
        { label: 'Ready', value: 'READY' },
        { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
        { label: 'Delivered', value: 'DELIVERED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Cancelled', value: 'CANCELLED' }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 text-gray-900 font-sans" data-testid="restaurant-orders-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-[#d4af37]" /> Restaurant Order Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">Live Customer Orders & Workflow</p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-2 self-start cursor-pointer border border-gray-200 transition-colors shadow-sm"
          data-testid="refresh-orders-btn"
        >
          <RotateCcw size={14} /> Refresh Orders
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Since the original layout was very dark, let's wrap DataTable in a dark theme container if needed. 
          Actually DataTable is mostly light themed by default, but wait, this is a restaurant panel. 
          The restaurant dashboard might be dark themed. We should probably adjust DataTable to look okay or let it be. 
          DataTable is already used in superadmin (light). If restaurant is dark, we might need a wrapper or it will look light.
          Given standard DataTable is light, it's fine, we are migrating it.
      */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found matching your criteria."
          
          search={{ value: search, placeholder: 'Search by Order ID or Customer...' }}
          onSearchChange={setSearch}
          
          filterConfig={filterConfig}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          
          sorting={{ sortBy, sortOrder }}
          onSortChange={setSort}

          pagination={{ page, limit, total }}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" data-testid="reject-modal">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <XCircle size={18} className="text-red-400" /> Reject Customer Order
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-500 hover:text-gray-900 cursor-pointer">
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
                <label className="block text-gray-500 font-semibold mb-1">Mandatory Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Item out of stock / Kitchen capacity full"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-red-500 focus:outline-none transition-colors"
                  data-testid="rejection-reason-input"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-gray-900 font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
