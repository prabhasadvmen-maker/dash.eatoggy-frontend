import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerGetMe, customerGetDashboard } from '../../services/customerAuthService.js';
import {
  UtensilsCrossed, IndianRupee, ShoppingBag, MapPin,
  Loader2, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, dashboardRes] = await Promise.all([
          customerGetMe(),
          customerGetDashboard()
        ]);

        if (profileRes.ok && profileRes.data.success) {
          setUser(profileRes.data.data.customer);
          localStorage.setItem('customer_user', JSON.stringify(profileRes.data.data.customer));
        } else {
          throw new Error('Profile fetch failed');
        }

        if (dashboardRes.ok && dashboardRes.data.success) {
          setDashboardData(dashboardRes.data.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        navigate('/user/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-red-500">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Meal Plan',
      value: dashboardData?.activeSubscriptionsCount > 0 ? `${dashboardData.activeSubscriptionsCount} Active` : '0 Active',
      subtitle: dashboardData?.activeSubscription ? `${dashboardData.activeSubscription.name} — ${dashboardData.activeSubscription.mealTime}` : 'No active plans',
      icon: UtensilsCrossed,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Eatoggy Cash',
      value: `₹${dashboardData?.eatoggyCash || 0}`,
      subtitle: 'Available wallet balance',
      icon: IndianRupee,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Orders',
      value: dashboardData?.totalOrdersCount || 0,
      subtitle: 'Lifetime orders placed',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Saved Addresses',
      value: `${dashboardData?.savedAddressesCount || 0} Saved`,
      subtitle: 'Delivery locations',
      icon: MapPin,
      color: 'text-[#d4af37]',
      bgColor: 'bg-[#d4af37]/20',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Customer'} 👋
          </h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        {dashboardData?.activeSubscription && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Meal Plan — {dashboardData.activeSubscription.mealTime} Arriving Soon
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={stat.color} size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h2>
              <h3 className="font-semibold text-gray-800">{stat.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      {dashboardData?.monthlyData && dashboardData.monthlyData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Monthly Orders</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Orders Delivered Trend</p>
              </div>
              <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">Live Trend</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.monthlyData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" name="Orders" dataKey="orders" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spend vs Savings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Food Spend & Savings</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Monthly Spending vs Savings</p>
              </div>
              <span className="px-3 py-1 bg-[#d4af37]/20 text-[#a58523] text-xs font-semibold rounded-full">Monthly</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.monthlyData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                  <Bar dataKey="spend"   name="Food Spend (₹)"    fill="#d4af37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="Promo Savings (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500">Not enough data to display monthly trends.</p>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <p className="text-xs text-gray-400 mt-0.5">Your latest food delivery history</p>
          </div>
          <button
            onClick={() => navigate('/user/orders')}
            className="text-xs font-bold text-[#d4af37] hover:underline cursor-pointer"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Meal Item</th>
                  <th className="px-6 py-4">Cloud Kitchen</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dashboardData.recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {ord.items?.length > 0 ? ord.items[0].foodNameSnapshot + (ord.items.length > 1 ? ` +${ord.items.length - 1} more` : '') : 'Custom Order'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{ord.restaurantId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{ord.pricing?.grandTotal || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'CANCELLED' || ord.orderStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus === 'DELIVERED' ? '✓ Delivered' : ord.orderStatus === 'CANCELLED' || ord.orderStatus === 'REJECTED' ? '✕ Cancelled' : '🚚 In Transit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No recent orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
