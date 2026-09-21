import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerGetMe } from '../../services/customerAuthService.js';
import {
  UtensilsCrossed, IndianRupee, ShoppingBag, MapPin,
  Clock, Star, CreditCard
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const monthlyOrdersData = [
  { month: 'Jan', orders: 8 },
  { month: 'Feb', orders: 12 },
  { month: 'Mar', orders: 15 },
  { month: 'Apr', orders: 10 },
  { month: 'May', orders: 18 },
  { month: 'Jun', orders: 14 },
  { month: 'Jul', orders: 20 },
];

const monthlySpendingData = [
  { month: 'Jan', spend: 1800, savings: 400 },
  { month: 'Feb', spend: 2400, savings: 650 },
  { month: 'Mar', spend: 3100, savings: 900 },
  { month: 'Apr', spend: 2200, savings: 500 },
  { month: 'May', spend: 3800, savings: 1200 },
  { month: 'Jun', spend: 2900, savings: 850 },
  { month: 'Jul', spend: 4200, savings: 1500 },
];

const recentOrders = [
  { id: 'ORD-9821', item: 'Deluxe North Indian Thali',      kitchen: 'Urban Spice Kitchen',    date: '01 Sep 2026, 1:15 PM',  status: 'In Transit', amount: '₹149' },
  { id: 'ORD-9740', item: 'Paneer Butter Masala + 4 Roti',  kitchen: 'Royal Punjabi Dhaba',    date: '31 Aug 2026, 8:30 PM',  status: 'Delivered',  amount: '₹199' },
  { id: 'ORD-9612', item: 'High Protein Quinoa Salad Bowl', kitchen: 'Healthy Fit Bowl',       date: '29 Aug 2026, 1:30 PM',  status: 'Delivered',  amount: '₹179' },
  { id: 'ORD-9504', item: 'South Indian Idli Sambhar Combo',kitchen: 'South Express Tiffin',   date: '27 Aug 2026, 9:00 AM',  status: 'Delivered',  amount: '₹120' },
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await customerGetMe();
        if (res.ok && res.data.success) {
          setUser(res.data.data.customer);
          localStorage.setItem('customer_user', JSON.stringify(res.data.data.customer));
        } else {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_user');
          navigate('/user/login');
        }
      } catch {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        navigate('/user/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const statCards = [
    {
      title: 'Active Meal Plan',
      value: '1 Active',
      subtitle: 'Deluxe Thali — Lunch 1:30 PM',
      icon: UtensilsCrossed,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Eatoggy Cash',
      value: '₹250',
      subtitle: 'Available wallet balance',
      icon: IndianRupee,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Orders',
      value: '14',
      subtitle: 'Across 5 cloud kitchens',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Saved Addresses',
      value: '2 Saved',
      subtitle: 'Home & Office',
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Active Meal Plan — Lunch Arriving Soon
        </div>
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
              <AreaChart data={monthlyOrdersData}>
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
                <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
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
              <BarChart data={monthlySpendingData} barSize={16}>
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
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{ord.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{ord.item}</td>
                  <td className="px-6 py-4 text-gray-600">{ord.kitchen}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{ord.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{ord.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      ord.status === 'In Transit'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ord.status === 'In Transit' ? '🚚 In Transit' : '✓ Delivered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
