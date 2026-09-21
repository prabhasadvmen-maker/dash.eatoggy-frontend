import React, { useState, useEffect } from 'react';
import { Search, Eye, CreditCard, ShieldAlert, Store, UserSquare2, Ban } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [subDetail, setSubDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [search, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const response = await fetch(`${API_BASE_URL}/api/super-admin/subscriptions?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSubscriptions(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      setError('Network error while fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription as Admin?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/subscriptions/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSubscriptions(subscriptions.map(s => s._id === id ? { ...s, status: 'CANCELLED' } : s));
        if (subDetail) setSubDetail({ ...subDetail, subscription: { ...subDetail.subscription, status: 'CANCELLED' } });
      } else {
        alert(data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      alert('Network error while cancelling subscription');
    }
  };

  const openSubDetail = async (id) => {
    setSelectedSub(id);
    setLoadingDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/subscriptions/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSubDetail(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-emerald-100 text-emerald-800',
      PAUSED: 'bg-amber-100 text-amber-800',
      PENDING_PAYMENT: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-slate-800">Master Subscriptions Management</h1>
          <p className="text-slate-400 mt-1">Global view of all recurring tiffin subscriptions across EATOGGY</p>
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
            placeholder="Search subscription number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Subscription #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Restaurant & Plan</th>
                <th className="px-6 py-4 text-center">Completed</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Total Price</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading subscriptions...</td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">No subscriptions found.</td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {sub.customerId?.name || 'Customer'}
                      <div className="text-xs text-gray-400">{sub.customerId?.mobile}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {sub.planSnapshot?.name || 'Tiffin Plan'}
                      <div className="text-xs text-gray-400">{sub.restaurantId?.name}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {sub.completedOccurrencesCount} / {sub.totalOccurrences}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      ₹{sub.pricing?.grandTotal || 0}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => openSubDetail(sub._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>

                      {sub.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelSubscription(sub._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Ban size={14} /> Cancel
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

      {/* Subscription Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="text-amber-500" size={20} /> Subscription ({subDetail?.subscription?.subscriptionNumber})
              </h2>
              <button onClick={() => { setSelectedSub(null); setSubDetail(null); }} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none">&times;</button>
            </div>

            {loadingDetail || !subDetail ? (
              <div className="p-8 text-center text-gray-400">Loading details...</div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-amber-800/60 font-semibold">Plan</p>
                    <p className="font-bold text-slate-800 text-lg">{subDetail.subscription?.planSnapshot?.name}</p>
                    <p className="text-xs text-slate-600">{subDetail.subscription?.restaurantId?.name}</p>
                  </div>
                  <div>
                    {getStatusBadge(subDetail.subscription?.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-400 font-bold mb-1">Customer</p>
                    <p className="font-bold text-slate-800">{subDetail.subscription?.customerId?.name}</p>
                    <p className="text-slate-500">{subDetail.subscription?.customerId?.mobile}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-400 font-bold mb-1">Duration & Price</p>
                    <p className="font-bold text-slate-800">{formatDate(subDetail.subscription?.startDate)} – {formatDate(subDetail.subscription?.endDate)}</p>
                    <p className="font-bold text-amber-700 text-sm">₹{subDetail.subscription?.pricing?.grandTotal}</p>
                  </div>
                </div>

                {/* Occurrence History */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Daily Occurrences Timeline ({subDetail.occurrences?.length || 0})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {subDetail.occurrences?.map((occ, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{formatDate(occ.scheduledDate)}</span>
                          {occ.orderId && <span className="text-gray-400 ml-2">Order #{occ.orderId?.orderNumber}</span>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${occ.status === 'GENERATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                          {occ.status}
                        </span>
                      </div>
                    ))}
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

export default SuperAdminSubscriptions;
