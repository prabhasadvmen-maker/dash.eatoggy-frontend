import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Users, Store, Repeat, ShieldAlert, Calendar, Star, Headphones, CheckCircle2, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchReports(dateRange);
  }, [dateRange]);

  const fetchReports = async (range) => {
    try {
      setLoading(true);
      setError('');
      const url = `${API_BASE_URL}/api/super-admin/analytics/overview?range=${range}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const result = await response.json();
      if (response.ok && result.data) {
        setData(result.data);
      } else {
        // Fallback to legacy reports route if overview returns error
        const fallbackRes = await fetch(`${API_BASE_URL}/api/super-admin/reports`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
          }
        });
        const fallbackResult = await fallbackRes.json();
        if (fallbackRes.ok) {
          setData({ metrics: fallbackResult.data?.metrics, breakdowns: {} });
        } else {
          setError(result.message || 'Failed to fetch analytics');
        }
      }
    } catch (err) {
      setError('Network error while fetching analytics reports');
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {};
  const breakdowns = data?.breakdowns || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section with Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Platform Analytics & Financial Reports</h1>
          <p className="text-slate-400 mt-1">Real-time GMV telemetry, revenue breakdown, system metrics, and daily trends</p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <Calendar size={16} className="text-slate-400 ml-2 mr-1 shrink-0" />
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'this_month', label: 'This Month' }
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setDateRange(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                dateRange === preset.id
                  ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              id={`analytics-filter-${preset.id}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-gray-100">
          Loading platform metrics analytics...
        </div>
      ) : (
        <>
          {/* Main Financial KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-200/60 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Gross Merchandise Value (GMV)</span>
                <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-emerald-900 mt-1" id="kpi-gmv">₹{metrics.totalGMV || 0}</p>
              <p className="text-xs text-emerald-700/80 mt-2 font-medium">Total volume of fulfilled food & subscription sales</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200/60 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Estimated Platform Revenue (15%)</span>
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                  <IndianRupee size={16} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-amber-900 mt-1" id="kpi-revenue">₹{metrics.estimatedCommissionEarnings || 0}</p>
              <p className="text-xs text-amber-700/80 mt-2 font-medium">Net platform commission generated before partner payout</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/40 border border-blue-200/60 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Partner Bank Payouts</span>
                <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center font-bold">
                  <BarChart3 size={16} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-blue-900 mt-1" id="kpi-payouts">₹{metrics.totalPayoutsPaid || 0}</p>
              <p className="text-xs text-blue-700/80 mt-2 font-medium">Total net earnings settled directly to partner bank accounts</p>
            </div>
          </div>

          {/* Core System Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-amber-500" /> Total Orders
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2" id="kpi-orders">{metrics.totalOrders || 0}</p>
              <span className="text-[11px] text-emerald-600 font-medium">{metrics.deliveredOrders || 0} Delivered</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
                <Users size={14} className="text-blue-500" /> Customers
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2" id="kpi-customers">{metrics.totalCustomers || 0}</p>
              <span className="text-[11px] text-slate-400 font-medium">Platform users</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
                <Store size={14} className="text-indigo-500" /> Restaurants
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2" id="kpi-restaurants">{metrics.totalRestaurants || 0}</p>
              <span className="text-[11px] text-emerald-600 font-medium">{metrics.activeRestaurants || 0} Active</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
                <Repeat size={14} className="text-rose-500" /> Subscriptions
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2" id="kpi-subscriptions">{metrics.activeSubscriptions || 0}</p>
              <span className="text-[11px] text-slate-400 font-medium">Active plans</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
                <Star size={14} className="text-[#d4af37]" /> Avg Rating
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2" id="kpi-rating">{metrics.avgRating || 4.5} ★</p>
              <span className="text-[11px] text-slate-400 font-medium">{metrics.totalReviews || 0} reviews</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
                <Headphones size={14} className="text-purple-500" /> Open Tickets
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2" id="kpi-tickets">{metrics.openTickets || 0}</p>
              <span className="text-[11px] text-rose-600 font-medium">{metrics.urgentTickets || 0} Urgent</span>
            </div>
          </div>

          {/* Daily Order Trend Visualization */}
          {breakdowns.dailyTrends && breakdowns.dailyTrends.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Fulfilled Order Volume Breakdown</h3>
                  <p className="text-xs text-slate-400">Daily breakdown of delivered orders and generated revenue</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">Database Sync</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {breakdowns.dailyTrends.map((trend, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">{trend._id}</span>
                      <span className="text-base font-extrabold text-slate-900">{trend.count} Orders</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                      ₹{trend.revenue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SuperAdminReports;
