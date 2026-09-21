import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Undo2 } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminRefunds = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/super-admin/payments?status=REFUNDED`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPayments(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch refunds');
      }
    } catch (err) {
      setError('Network error while fetching refunds');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Refunds Audit Log</h1>
          <p className="text-slate-400 mt-1">Audit log of all refunded orders, subscriptions, and reason records</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Transaction / Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Refund Reason</th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4">Refunded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading refunds...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No refunded records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div>Order ID: <span className="font-mono text-xs text-gray-600">{p.razorpayOrderId}</span></div>
                      {p.refundDetails?.refundId && <div className="text-xs text-purple-600 font-mono">Refund ID: {p.refundDetails?.refundId}</div>}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {p.customer?.name || 'Customer'}
                      <div className="text-xs text-gray-400">{p.customer?.mobile}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {p.refundDetails?.reason || 'Admin initiated refund'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-purple-700">
                      ₹{p.refundDetails?.refundAmount || p.amount}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(p.refundDetails?.refundedAt || p.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRefunds;
