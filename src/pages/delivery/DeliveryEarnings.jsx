import React, { useState, useEffect } from 'react';
import { IndianRupee, ShieldAlert, CheckCircle2, Clock, Eye, X } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const DeliveryEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detail Modal State
  const [detailModal, setDetailModal] = useState({ open: false, statement: null, loading: false });

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/delivery/earnings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('delivery_token')}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch delivery earnings');
      }
    } catch (err) {
      setError('Network error while fetching delivery earnings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (settlementId) => {
    setDetailModal({ open: true, statement: null, loading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/delivery/earnings/${settlementId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('delivery_token')}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        setDetailModal({ open: true, statement: result.data, loading: false });
      } else {
        alert(result.message || 'Failed to fetch statement detail');
        setDetailModal({ open: false, statement: null, loading: false });
      }
    } catch (err) {
      alert('Network error loading statement detail');
      setDetailModal({ open: false, statement: null, loading: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Delivery Partner Earnings & Payouts</h1>
          <p className="text-slate-400 text-xs mt-1">Track your delivery pay, tips, platform settlements, and bank deposits</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-800/60 font-semibold">Total Paid Payouts</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">₹{data?.totalPaid || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-800/60 font-semibold">Pending Next Deposit</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">₹{data?.totalPending || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-slate-800 text-base">Payout Statements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Settlement #</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4 text-center">Deliveries</th>
                <th className="px-6 py-4 text-center">Gross Pay</th>
                <th className="px-6 py-4 text-center">Taxes/Deductions</th>
                <th className="px-6 py-4 text-center">Net Payout</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading payout statements...</td>
                </tr>
              ) : data?.settlements?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">No payout statements generated yet.</td>
                </tr>
              ) : (
                data?.settlements?.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 font-mono text-xs">{s.settlementNumber}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">{formatDate(s.periodStart)} – {formatDate(s.periodEnd)}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{s.totalOrdersCount}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">₹{s.grossEarnings}</td>
                    <td className="px-6 py-4 text-center font-semibold text-red-600">-₹{s.taxDeduction || 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-700 text-base">₹{s.netPayoutAmount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(s._id)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Statement Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-slate-800">
                Statement Breakdown: <span className="font-mono text-emerald-700">{detailModal.statement?.settlementNumber}</span>
              </h2>
              <button onClick={() => setDetailModal({ open: false, statement: null, loading: false })} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {detailModal.loading ? (
              <div className="py-8 text-center text-gray-400">Loading statement details...</div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Gross Delivery Earnings:</span>
                    <span>₹{detailModal.statement?.grossEarnings}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Tax Withholding / Deductions:</span>
                    <span>-₹{detailModal.statement?.taxDeduction || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800 text-sm border-t pt-2">
                    <span>Net Payout Amount:</span>
                    <span>₹{detailModal.statement?.netPayoutAmount}</span>
                  </div>
                </div>

                {detailModal.statement?.orderIds?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">Completed Delivery Jobs ({detailModal.statement.orderIds.length})</h3>
                    <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
                      {detailModal.statement.orderIds.map(o => (
                        <div key={o._id} className="p-2.5 flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-slate-700">{o.orderNumber}</span>
                          <span className="text-gray-500">{o.orderType}</span>
                          <span className="font-bold text-slate-800">₹{o.pricing?.deliveryFee || 40}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryEarnings;
