import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Banknote, Undo2 } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [refundModal, setRefundModal] = useState({ open: false, payment: null, reason: '' });
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter, purposeFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);
      if (purposeFilter) query.append('purpose', purposeFilter);

      const response = await fetch(`${API_BASE_URL}/api/super-admin/payments?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPayments(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch payments');
      }
    } catch (err) {
      setError('Network error while fetching payments');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Razorpay Order ID / Payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
          >
            <option value="">All Purposes</option>
            <option value="ORDER_PAYMENT">Order Payment</option>
            <option value="SUBSCRIPTION_PAYMENT">Subscription Payment</option>
            <option value="RESTAURANT_ONBOARDING">Restaurant Onboarding</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">No payment records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div>Order ID: <span className="font-mono text-xs text-gray-600">{p.razorpayOrderId}</span></div>
                      {p.razorpayPaymentId && <div className="text-xs text-gray-400 font-mono">Payment ID: {p.razorpayPaymentId}</div>}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {p.customer?.name || 'Customer'}
                      <div className="text-xs text-gray-400">{p.customer?.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-slate-700">
                        {p.purpose}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      ₹{p.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.status === 'PAID' && (
                        <button
                          onClick={() => setRefundModal({ open: true, payment: p, reason: '' })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Undo2 size={14} /> Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
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
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="flex-1 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 disabled:opacity-50"
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
