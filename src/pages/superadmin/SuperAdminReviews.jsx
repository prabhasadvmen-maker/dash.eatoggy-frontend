import React, { useState, useEffect } from 'react';
import { Star, ShieldAlert, EyeOff, ShieldCheck, Flag } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const response = await fetch(`${API_BASE_URL}/api/super-admin/reviews${query}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setReviews(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Network error while fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setReviews(reviews.map(r => r._id === reviewId ? { ...r, status: newStatus } : r));
      } else {
        alert(data.message || 'Failed to update review status');
      }
    } catch (err) {
      alert('Network error while updating review status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Master Reviews & Moderation Center</h1>
          <p className="text-slate-400 mt-1">Audit customer ratings across restaurants and moderate abusive or fake feedback</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
        >
          <option value="">All Review Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="HIDDEN">Hidden</option>
          <option value="FLAGGED">Flagged</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading master reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">No reviews found matching criteria.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 text-xs">
                      {rev.customerId?.fullName || rev.customerId?.name || 'Customer'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 text-xs">
                      {rev.restaurantId?.name || 'Restaurant'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">
                      ★ {rev.rating}/5
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs text-xs">
                      {rev.comment || 'No text'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(rev.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${rev.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : rev.status === 'HIDDEN' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-800'}`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {rev.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleUpdateStatus(rev._id, 'PUBLISHED')}
                            title="Publish"
                            className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        {rev.status !== 'HIDDEN' && (
                          <button
                            onClick={() => handleUpdateStatus(rev._id, 'HIDDEN')}
                            title="Hide Review"
                            className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                        {rev.status !== 'FLAGGED' && (
                          <button
                            onClick={() => handleUpdateStatus(rev._id, 'FLAGGED')}
                            title="Flag Review"
                            className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Flag size={14} />
                          </button>
                        )}
                      </div>
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

export default SuperAdminReviews;
