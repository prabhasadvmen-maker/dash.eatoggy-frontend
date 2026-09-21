import React, { useState, useEffect } from 'react';
import { ShoppingBag, IndianRupee, MenuSquare, Star, Headphones, CheckCircle2, TrendingUp } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const RestaurantOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    fetchRestaurantAnalytics();
  }, []);

  const fetchRestaurantAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('restaurantToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/restaurants/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.data) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch kitchen analytics');
      }
    } catch (err) {
      setError('Network error while fetching kitchen analytics');
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Analytics & Overview</h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Kitchen Open - Accepting Orders
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-gray-100">
          Loading real-time kitchen telemetry...
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <ShoppingBag className="text-orange-600" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1" id="restaurant-stat-orders">{metrics.totalOrders || 0}</h2>
              <h3 className="font-semibold text-gray-800">Total Orders Received</h3>
              <p className="text-xs text-gray-500 mt-1">{metrics.deliveredOrders || 0} fulfilled / {metrics.cancelledOrders || 0} cancelled</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <IndianRupee className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1" id="restaurant-stat-net">₹{metrics.netEarnings || 0}</h2>
              <h3 className="font-semibold text-gray-800">Net Restaurant Earnings</h3>
              <p className="text-xs text-gray-500 mt-1">GMV: ₹{metrics.totalRevenue || 0} (15% Comm: ₹{metrics.platformCommission || 0})</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1" id="restaurant-stat-aov">₹{metrics.avgOrderValue || 0}</h2>
              <h3 className="font-semibold text-gray-800">Average Order Value (AOV)</h3>
              <p className="text-xs text-gray-500 mt-1">Per delivered food basket</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#d4af37]/20 rounded-xl flex items-center justify-center mb-4">
                <Star className="text-[#d4af37]" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1" id="restaurant-stat-rating">{metrics.avgRating || 0} ★</h2>
              <h3 className="font-semibold text-gray-800">Average Customer Rating</h3>
              <p className="text-xs text-gray-500 mt-1">from {metrics.totalReviews || 0} verified customer reviews</p>
            </div>
          </div>

          {/* Operational Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Support Tickets & Operations</h3>
              <p className="text-xs text-slate-500">Active support tickets linked to your restaurant partner account</p>
            </div>
            <div className="flex items-center gap-2">
              <Headphones size={18} className="text-purple-600" />
              <span className="text-sm font-bold text-slate-900" id="restaurant-stat-tickets">{metrics.supportTicketsCount || 0} Active Tickets</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantOverview;
