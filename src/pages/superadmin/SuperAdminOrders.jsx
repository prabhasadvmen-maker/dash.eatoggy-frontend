import React, { useState, useEffect } from 'react';
import { Search, Eye, ShoppingBag, ShieldAlert, Store, UserSquare2, Bike } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, typeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);
      if (typeFilter) query.append('orderType', typeFilter);

      const response = await fetch(`${API_BASE_URL}/api/super-admin/orders?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetail = async (id) => {
    setSelectedOrder(id);
    setLoadingDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrderDetail(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PLACED: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-indigo-100 text-indigo-800',
      PREPARING: 'bg-amber-100 text-amber-800',
      READY: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Master Orders Management</h1>
          <p className="text-slate-400 mt-1">Live monitoring of all regular and subscription orders across EATOGGY</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
          >
            <option value="">All Types</option>
            <option value="REGULAR">Regular Orders</option>
            <option value="SUBSCRIPTION">Subscription Orders</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {order.customerId?.name || 'Customer'}
                      <div className="text-xs text-gray-400">{order.customerId?.mobile}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {order.restaurantId?.name || 'Restaurant'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${order.orderType === 'SUBSCRIPTION' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                        {order.orderType || 'REGULAR'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      ₹{order.pricing?.grandTotal || 0}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openOrderDetail(order._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-amber-500" size={20} /> Order Summary ({orderDetail?.orderNumber})
              </h2>
              <button onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none">&times;</button>
            </div>

            {loadingDetail || !orderDetail ? (
              <div className="p-8 text-center text-gray-400">Loading order details...</div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-amber-800/60 font-semibold">Order Number</p>
                    <p className="font-bold text-slate-800 text-lg">{orderDetail.orderNumber}</p>
                  </div>
                  <div>
                    {getStatusBadge(orderDetail.orderStatus)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1"><UserSquare2 size={14}/> Customer</p>
                    <p className="font-bold text-slate-800">{orderDetail.customerId?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-600">{orderDetail.customerId?.mobile}</p>
                    <p className="text-xs text-slate-500 mt-2">{orderDetail.deliveryAddressSnapshot?.addressLine1}, {orderDetail.deliveryAddressSnapshot?.city}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1"><Store size={14}/> Restaurant</p>
                    <p className="font-bold text-slate-800">{orderDetail.restaurantId?.name || 'Restaurant'}</p>
                    <p className="text-xs text-slate-600">{orderDetail.restaurantId?.mobile}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Item Breakdown</h3>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {orderDetail.itemsSnapshot?.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{item.name} × {item.quantity}</span>
                        <span className="font-bold text-slate-700">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{orderDetail.pricing?.itemTotal || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Packaging Fee</span>
                    <span>₹{orderDetail.pricing?.packagingFee || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>₹{orderDetail.pricing?.deliveryFee || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Fees</span>
                    <span>₹{(orderDetail.pricing?.tax || 0) + (orderDetail.pricing?.platformFee || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 text-sm pt-2 border-t border-gray-200">
                    <span>Grand Total</span>
                    <span className="text-amber-700">₹{orderDetail.pricing?.grandTotal || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminOrders;
