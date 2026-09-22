import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Banknote, Undo2 } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const SuperAdminPayments = () => {
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

      const response = await fetch(`${API_BASE_URL}/api/super-admin/payments?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
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
      const response = await fetch(`${API_BASE_URL}/api/super-admin/payments/${refundModal.payment._id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
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
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      key: 'razorpayOrderId',
      label: 'Transaction Details',
      sortable: false,
      render: (row) => (
        <div>
          <div>Order ID: <span className="font-mono text-xs text-gray-600">{row.razorpayOrderId}</span></div>
          {row.razorpayPaymentId && <div className="text-xs text-gray-400 font-mono">Payment ID: {row.razorpayPaymentId}</div>}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: false,
      render: (row) => (
        <div>
          <div className="font-medium text-slate-700">{row.customer?.name || 'Customer'}</div>
          <div className="text-xs text-gray-400">{row.customer?.mobile}</div>
        </div>
      )
    },
    {
      key: 'purpose',
      label: 'Purpose',
      sortable: false,
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-slate-700">
          {row.purpose}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      align: 'center',
      render: (row) => <span className="font-bold text-slate-800">₹{row.amount}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-medium whitespace-nowrap">{formatDate(row.createdAt)}</span>
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end">
          {row.status === 'PAID' && (
            <button
              onClick={() => setRefundModal({ open: true, payment: row, reason: '' })}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Undo2 size={14} /> Refund
            </button>
          )}
        </div>
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
          <h1 className="text-3xl font-bold text-slate-800">Master Payments & Transactions</h1>
          <p className="text-slate-400 mt-1">Audit Razorpay payment receipts, signatures, and process customer refunds</p>
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
    </div>
  );
};

export default SuperAdminPayments;
