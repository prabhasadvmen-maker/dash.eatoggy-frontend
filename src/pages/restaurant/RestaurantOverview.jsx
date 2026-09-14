import React from 'react';
import { ShoppingBag, IndianRupee, MenuSquare, Star } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const statCards = [
  {
    title: "Today's Orders",
    value: '45',
    subtitle: '12 currently active',
    icon: ShoppingBag,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: "Today's Revenue",
    value: '₹14,250',
    subtitle: '₹2,500 pending settlement',
    icon: IndianRupee,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    title: 'Active Menu Items',
    value: '84',
    subtitle: '4 items currently out of stock',
    icon: MenuSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Average Rating',
    value: '4.8',
    subtitle: 'from 324 reviews',
    icon: Star,
    color: 'text-[#d4af37]',
    bgColor: 'bg-[#d4af37]/20',
  },
];

const hourlyOrdersData = [
  { time: '10 AM', orders: 4 },
  { time: '12 PM', orders: 15 },
  { time: '2 PM', orders: 8 },
  { time: '4 PM', orders: 5 },
  { time: '6 PM', orders: 12 },
  { time: '8 PM', orders: 22 },
  { time: '10 PM', orders: 9 },
];

const weeklyRevenueData = [
  { day: 'Mon', revenue: 12000 },
  { day: 'Tue', revenue: 11500 },
  { day: 'Wed', revenue: 14000 },
  { day: 'Thu', revenue: 13200 },
  { day: 'Fri', revenue: 18500 },
  { day: 'Sat', revenue: 24000 },
  { day: 'Sun', revenue: 22000 },
];

const RestaurantOverview = () => {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Kitchen Open - Accepting Orders
        </div>
      </div>

      {/* Stats Cards */}
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
        {/* Hourly Orders Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Orders</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Hourly Trend</p>
            </div>
            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">Live</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyOrdersData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="orders" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Weekly Revenue</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Last 7 Days</p>
            </div>
            <span className="px-3 py-1 bg-[#d4af37]/10 text-[#a58523] text-xs font-semibold rounded-full">Verified</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenueData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOverview;
