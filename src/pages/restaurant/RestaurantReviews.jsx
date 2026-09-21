import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Reply, ShieldAlert, CheckCircle2 } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const RestaurantReviews = () => {
  const [data, setData] = useState({ reviews: [], avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyModal, setReplyModal] = useState({ open: false, review: null, comment: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/restaurants/reviews`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('restaurant_token')}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.data || { reviews: [], avgRating: 0, totalReviews: 0 });
      } else {
        setError(result.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Network error while fetching reviews');
    } finally {
      setLoading(false);
    }
  };

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
        setData({
          ...data,
          reviews: data.reviews.map(r => r._id === replyModal.review._id ? result.data : r)
        });
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Ratings & Reviews</h1>
          <p className="text-slate-400 text-xs mt-1">Review feedback, food ratings, and respond directly to your diners</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Ratings Summary Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/60 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-900 font-extrabold text-2xl flex items-center justify-center shadow-md">
            {data.avgRating || '5.0'}
          </div>
          <div>
            <div className="flex text-amber-500 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-1">Based on {data.totalReviews || 0} diner reviews</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="bg-white/80 border border-amber-200 px-4 py-2 rounded-xl text-slate-700">
            Food Quality: <span className="font-bold text-amber-600">★ {data.avgFoodRating || data.avgRating || 5.0}/5</span>
          </div>
          <div className="bg-white/80 border border-amber-200 px-4 py-2 rounded-xl text-slate-700">
            Delivery Speed: <span className="font-bold text-amber-600">★ {data.avgDeliveryRating || data.avgRating || 5.0}/5</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-gray-100">
            Loading reviews...
          </div>
        ) : data.reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-gray-100">
            No customer reviews posted yet.
          </div>
        ) : (
          data.reviews.map((rev) => (
            <div key={rev._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{rev.customerId?.fullName || rev.customerId?.name || 'Valued Customer'}</h3>
                  <p className="text-xs text-slate-400">{formatDate(rev.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold text-xs border border-amber-200">
                  <Star size={14} fill="currentColor" /> {rev.rating}/5
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">{rev.comment || 'No written comment provided.'}</p>

              {rev.reply ? (
                <div className="bg-slate-50 border-l-4 border-amber-400 p-3 rounded-r-xl space-y-1">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Reply size={12} className="text-amber-600" /> Restaurant Response
                  </p>
                  <p className="text-xs text-slate-600 italic">{rev.reply.comment}</p>
                </div>
              ) : (
                <button
                  onClick={() => setReplyModal({ open: true, review: rev, comment: '' })}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors pt-1"
                >
                  <Reply size={14} /> Reply to Customer
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-amber-500" size={18} /> Reply to Diner
            </h2>
            <p className="text-xs text-slate-500 italic">"{replyModal.review?.comment}"</p>

            <form onSubmit={handlePostReply} className="space-y-4">
              <div>
                <textarea
                  value={replyModal.comment}
                  onChange={(e) => setReplyModal({ ...replyModal, comment: e.target.value })}
                  placeholder="Thank the diner or address their feedback professionally..."
                  required
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReplyModal({ open: false, review: null, comment: '' })}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-900 font-bold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50"
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
