import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Reply, ShieldAlert } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const RestaurantReviews = () => {
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

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [summaryData, setSummaryData] = useState({ avgRating: 0, avgFoodRating: 0, avgDeliveryRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [replyModal, setReplyModal] = useState({ open: false, review: null, comment: '' });
  const [processing, setProcessing] = useState(false);

  const fetchReviews = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/restaurants/reviews?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('restaurant_token')}`
        }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setReviews(result.data || []);
        if (result.meta && result.meta.pagination) {
          setTotal(result.meta.pagination.total);
        } else {
          setTotal(result.data?.length || 0);
        }
        if (result.summary) {
          setSummaryData(result.summary);
        }
      } else {
        setError(result.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Network error while fetching reviews');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyModal.review) return;
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants/reviews/${replyModal.review._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('restaurant_token')}`
        },
        body: JSON.stringify({ comment: replyModal.comment })
      });
      const result = await response.json();
      if (response.ok) {
        fetchReviews();
        setReplyModal({ open: false, review: null, comment: '' });
      } else {
        alert(result.message || 'Failed to post reply');
      }
    } catch (err) {
      alert('Network error while posting reply');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      sortable: false,
      render: (row) => (
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{row.customerId?.fullName || row.customerId?.name || 'Valued Customer'}</h3>
          <p className="text-xs text-slate-400">{formatDate(row.createdAt)}</p>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold text-xs border border-amber-200 w-fit">
          <Star size={14} fill="currentColor" /> {row.rating}/5
        </div>
      )
    },
    {
      key: 'comment',
      label: 'Review',
      sortable: true,
      render: (row) => (
        <div className="min-w-[200px]">
          <p className="text-slate-600 text-xs leading-relaxed max-w-sm line-clamp-2" title={row.comment}>
            {row.comment || 'No written comment provided.'}
          </p>
          {row.reply && (
            <div className="bg-slate-50 border-l-4 border-amber-400 p-2 mt-2 rounded-r-lg space-y-0.5">
              <p className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <Reply size={10} className="text-amber-600" /> Response
              </p>
              <p className="text-xs text-slate-600 italic line-clamp-1" title={row.reply.comment}>{row.reply.comment}</p>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (row) => (
        <div>
          {!row.reply && (
            <button
              onClick={() => setReplyModal({ open: true, review: row, comment: '' })}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors pt-1 cursor-pointer whitespace-nowrap"
            >
              <Reply size={14} /> Reply
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Customer Ratings & Reviews</h1>
          <p className="text-slate-500 text-sm mt-1">Review feedback, food ratings, and respond directly to your diners</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 font-semibold text-sm">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Ratings Summary Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/60 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-900 font-black text-3xl flex items-center justify-center shadow-md">
            {summaryData.avgRating ? summaryData.avgRating.toFixed(1) : '5.0'}
          </div>
          <div>
            <div className="flex text-amber-500 gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill={i < Math.round(summaryData.avgRating || 5) ? 'currentColor' : 'none'} strokeWidth={i < Math.round(summaryData.avgRating || 5) ? 0 : 2} />
              ))}
            </div>
            <p className="text-sm text-slate-600 font-bold mt-1.5">Based on {summaryData.totalReviews || 0} diner reviews</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
          <div className="bg-white/90 border border-amber-200 px-5 py-2.5 rounded-xl text-slate-700 shadow-sm">
            Food Quality: <span className="font-black text-amber-600 ml-1">★ {summaryData.avgFoodRating ? summaryData.avgFoodRating.toFixed(1) : (summaryData.avgRating ? summaryData.avgRating.toFixed(1) : '5.0')}/5</span>
          </div>
          <div className="bg-white/90 border border-amber-200 px-5 py-2.5 rounded-xl text-slate-700 shadow-sm">
            Delivery Speed: <span className="font-black text-amber-600 ml-1">★ {summaryData.avgDeliveryRating ? summaryData.avgDeliveryRating.toFixed(1) : (summaryData.avgRating ? summaryData.avgRating.toFixed(1) : '5.0')}/5</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={reviews}
          loading={loading}
          emptyMessage="No customer reviews posted yet."
          
          search={{ value: search, placeholder: 'Search in comments...' }}
          onSearchChange={setSearch}
          
          sorting={{ sortBy, sortOrder }}
          onSortChange={setSort}

          pagination={{ page, limit, total }}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-amber-500" size={20} /> Reply to Diner
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-slate-600 italic">"{replyModal.review?.comment}"</p>
            </div>

            <form onSubmit={handlePostReply} className="space-y-4">
              <div>
                <textarea
                  value={replyModal.comment}
                  onChange={(e) => setReplyModal({ ...replyModal, comment: e.target.value })}
                  placeholder="Thank the diner or address their feedback professionally..."
                  required
                  rows="4"
                  className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReplyModal({ open: false, review: null, comment: '' })}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-900 font-bold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
                >
                  {processing ? 'Posting...' : 'Post Official Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantReviews;
