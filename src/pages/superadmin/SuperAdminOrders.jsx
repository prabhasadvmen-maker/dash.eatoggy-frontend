import React, { useState, useEffect, useCallback } from 'react';
import { Eye, ShoppingBag, ShieldAlert, Store, UserSquare2, Bike } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const SuperAdminOrders = () => {
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
  const [error, setError] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });
      
      if (search) queryParams.append('search', search);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/super-admin/orders?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) {
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error while fetching orders');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-800">{row.orderNumber}</span>
    },
    {
      key: 'customerId',
      label: 'Customer',
      sortable: false, // sorting by nested obj not natively supported easily without agg
      render: (row) => (
        <div>
          <div className="font-medium text-slate-700">{row.customerId?.name || 'Customer'}</div>
          <div className="text-xs text-slate-400">{row.customerId?.mobile}</div>
        </div>
      )
    },
    {
      key: 'restaurantId',
      label: 'Restaurant',
      sortable: false,
      render: (row) => <span className="font-medium text-slate-700">{row.restaurantId?.name || 'Restaurant'}</span>
    },
    {
      key: 'orderType',
      label: 'Type',
      sortable: false,
      align: 'center',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${row.orderType === 'SUBSCRIPTION' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
          {row.orderType || 'REGULAR'}
        </span>
      )
    },
    {
      key: 'orderStatus',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => getStatusBadge(row.orderStatus)
    },
    {
      key: 'pricing.grandTotal',
      label: 'Amount',
      sortable: true,
      align: 'center',
      render: (row) => <span className="font-bold text-slate-800">₹{row.pricing?.grandTotal || 0}</span>
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-medium whitespace-nowrap">{formatDate(row.createdAt)}</span>
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => openOrderDetail(row._id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Eye size={14} /> View
        </button>
      )
    }
  ];

  const filterConfig = [
    {
      key: 'orderType',
      label: 'Type',
      type: 'select',
      options: [
        { label: 'Regular Orders', value: 'REGULAR' },
        { label: 'Subscription Orders', value: 'SUBSCRIPTION' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Placed', value: 'PLACED' },
        { label: 'Accepted', value: 'ACCEPTED' },
        { label: 'Preparing', value: 'PREPARING' },
        { label: 'Ready', value: 'READY' },
        { label: 'Delivered', value: 'DELIVERED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Cancelled', value: 'CANCELLED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found matching your criteria."
        
        search={{ value: search, placeholder: 'Search order number...' }}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-amber-500" size={20} /> Order Summary ({orderDetail?.orderNumber})
              </h2>
              <button onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none cursor-pointer">&times;</button>
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
