import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Banknote, Undo2, Settings, Eye, X } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';
const ActionDropdown = ({ row, onRefund, onViewDetail }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    if (open) window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Settings"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onViewDetail(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={14} className="text-gray-500" />
            View Details
          </button>
          
          {row.status === 'PAID' && (
            <div className="h-[1px] bg-gray-100 my-1"></div>
          )}
          {row.status === 'PAID' && (
            <button
              onClick={() => { setOpen(false); onRefund(row); }}
              className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
            >
              <Undo2 size={14} className="text-purple-600" />
              Refund
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const AdminFinance = () => {
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

  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [refundModal, setRefundModal] = useState({ open: false, payment: null, reason: '' });
  const [detailModal, setDetailModal] = useState({ open: false, payment: null });
  const [stats, setStats] = useState({ totalRevenue: 0 });
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/admins/finance?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPayments(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) {
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.message || 'Failed to fetch payments');
      }
    } catch (err) {
      setError('Network error while fetching payments');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleInitiateRefund = async (e) => {
    e.preventDefault();
    if (!refundModal.payment) return;
    setRefunding(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admins/payments/${refundModal.payment._id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ reason: refundModal.reason })
      });
      const data = await response.json();
      if (response.ok) {
        setPayments(payments.map(p => p._id === refundModal.payment._id ? { ...p, status: 'REFUNDED' } : p));
        setRefundModal({ open: false, payment: null, reason: '' });
      } else {
        alert(data.message || 'Failed to process refund');
      }
    } catch (err) {
      alert('Network error while processing refund');
    } finally {
      setRefunding(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-emerald-100 text-emerald-800',
      PENDING: 'bg-amber-100 text-amber-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'srNo',
      label: 'Sr. No.',
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium text-sm">
          {((page - 1) * limit) + rowIndex + 1}
        </span>
      )
    },
    {
      key: 'razorpayOrderId',
      label: 'Transaction Details',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <div className="truncate max-w-[150px]" title={row.razorpayOrderId}>Order ID: <span className="font-mono text-xs text-gray-600">{row.razorpayOrderId}</span></div>
          {row.razorpayPaymentId && <div className="text-xs text-gray-400 font-mono truncate max-w-[150px]" title={row.razorpayPaymentId}>Payment ID: {row.razorpayPaymentId}</div>}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Paid By',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => {
        let name = 'Unknown';
        let mobile = '';
        let type = 'Customer';
        
        if (row.customer) { 
          name = row.customer.name; 
          mobile = row.customer.mobile; 
          type = 'Customer'; 
        } else if (row.restaurant) { 
          name = row.restaurant.name || row.restaurant.restaurantName; 
          mobile = row.restaurant.mobile; 
          type = 'Restaurant'; 
        } else if (row.deliveryPartner) { 
          name = row.deliveryPartner.fullName; 
          mobile = row.deliveryPartner.mobile; 
          type = 'Rider'; 
        }

        return (
          <div className="whitespace-nowrap">
            <div className="font-medium text-slate-700 truncate max-w-[120px]" title={name}>{name || 'Unknown'}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              {mobile}
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded uppercase">{type}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'purpose',
      label: 'Purpose',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-slate-700 whitespace-nowrap">
          {row.purpose}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-slate-800">₹{row.amount}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="text-slate-400 font-medium whitespace-nowrap text-xs">{formatDate(row.createdAt)}</span>
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <ActionDropdown
          row={row}
          onRefund={(row) => setRefundModal({ open: true, payment: row, reason: '' })}
          onViewDetail={(row) => setDetailModal({ open: true, payment: row })}
        />
      )
    }
  ];

  const filterConfig = [
    {
      key: 'purpose',
      label: 'Purpose',
      type: 'select',
      options: [
        { label: 'Order Payment', value: 'ORDER_PAYMENT' },
        { label: 'Subscription Payment', value: 'SUBSCRIPTION_PAYMENT' },
        { label: 'Restaurant Onboarding', value: 'RESTAURANT_ONBOARDING' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Paid', value: 'PAID' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Refunded', value: 'REFUNDED' },
        { label: 'Failed', value: 'FAILED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Finance & Payments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and manage platform revenue, customer payments, and refunds.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Banknote className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-xl font-black text-emerald-700">₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}</p>
            </div>
          </div>
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
        data={payments}
        loading={loading}
        emptyMessage="No payment records found matching your criteria."
        
        search={{ value: search, placeholder: 'Search Razorpay Order ID / Payment ID...' }}
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

      {/* Refund Modal */}
      {refundModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Undo2 className="text-purple-600" size={20} /> Initiate Refund
            </h2>
            <p className="text-xs text-gray-500">
              Refunding transaction <span className="font-bold font-mono">{refundModal.payment?.razorpayOrderId}</span> of amount <span className="font-bold text-slate-800">₹{refundModal.payment?.amount}</span>.
            </p>

            <form onSubmit={handleInitiateRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Refund</label>
                <textarea
                  value={refundModal.reason}
                  onChange={(e) => setRefundModal({ ...refundModal, reason: e.target.value })}
                  placeholder="Enter detailed reason for initiating refund..."
                  required
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModal({ open: false, payment: null, reason: '' })}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="flex-1 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                >
                  {refunding ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.open && detailModal.payment && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Banknote className="text-blue-600" size={20} /> Transaction Details
              </h2>
              <button
                onClick={() => setDetailModal({ open: false, payment: null })}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Payment Details */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Razorpay Order ID</div>
                    <div className="text-sm font-mono text-gray-800 break-all">{detailModal.payment.razorpayOrderId || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Razorpay Payment ID</div>
                    <div className="text-sm font-mono text-gray-800 break-all">{detailModal.payment.razorpayPaymentId || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Amount</div>
                    <div className="text-sm font-bold text-slate-800">₹{detailModal.payment.amount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Status</div>
                    <div>{getStatusBadge(detailModal.payment.status)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Purpose</div>
                    <div className="text-sm text-gray-800 font-medium break-all">{detailModal.payment.purpose}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Date</div>
                    <div className="text-sm text-gray-800">{formatDate(detailModal.payment.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Payer Details */}
              {(detailModal.payment.customer || detailModal.payment.restaurant || detailModal.payment.deliveryPartner) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payer Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-bold text-gray-800">
                        {detailModal.payment.customer?.name || 
                         detailModal.payment.restaurant?.name || detailModal.payment.restaurant?.restaurantName ||
                         detailModal.payment.deliveryPartner?.fullName || 'Unknown'}
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {detailModal.payment.customer ? 'Customer' : 
                         detailModal.payment.restaurant ? 'Restaurant' : 
                         detailModal.payment.deliveryPartner ? 'Delivery Partner' : 'User'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {detailModal.payment.customer?.mobile || 
                       detailModal.payment.restaurant?.mobile || 
                       detailModal.payment.deliveryPartner?.mobile || 'No Mobile'}
                    </div>
                    {(detailModal.payment.customer?.email || detailModal.payment.restaurant?.email || detailModal.payment.deliveryPartner?.email) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {detailModal.payment.customer?.email || detailModal.payment.restaurant?.email || detailModal.payment.deliveryPartner?.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reference Metadata */}
              {detailModal.payment.referenceId && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Reference Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Reference ID</div>
                    <div className="text-sm font-mono text-gray-800 break-all">{detailModal.payment.referenceId}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;
