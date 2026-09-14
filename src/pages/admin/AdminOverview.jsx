import React from 'react';
import { Users, Briefcase, Calendar, IndianRupee } from 'lucide-react';
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
    title: 'Total Users',
    value: '4,210',
    subtitle: 'active this month',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Active Services',
    value: '84',
    subtitle: 'currently available',
    icon: Briefcase,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Total Bookings',
    value: '1,250',
    subtitle: 'completed this month',
    icon: Calendar,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Revenue Generated',
    value: '₹8.5L',
    subtitle: 'total collected',
    icon: IndianRupee,
    color: 'text-[#d4af37]',
    bgColor: 'bg-[#d4af37]/20',
  },
];

const bookingsData = [
  { name: 'Jan', bookings: 200 },
  { name: 'Feb', bookings: 300 },
  { name: 'Mar', bookings: 250 },
  { name: 'Apr', bookings: 400 },
  { name: 'May', bookings: 550 },
  { name: 'Jun', bookings: 500 },
];

const financialData = [
  { name: 'Jan', income: 3000, expenses: 1400 },
  { name: 'Feb', income: 2000, expenses: 998 },
  { name: 'Mar', income: 4000, expenses: 2800 },
  { name: 'Apr', income: 2780, expenses: 1908 },
  { name: 'May', income: 4890, expenses: 2800 },
  { name: 'Jun', income: 4390, expenses: 2100 },
];

const AdminOverview = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 text-[#a58523] rounded-full text-sm font-medium border border-[#d4af37]/20 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
          System Live and Synchronized
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
        {/* Bookings Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Service Bookings</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Last 6 Months</p>
            </div>
            <span className="px-3 py-1 bg-[#d4af37]/10 text-[#a58523] text-xs font-semibold rounded-full">Monthly</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingsData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Trends Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Financial Trends</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Income vs Expenses</p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Live Trend</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="#d4af37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#1e1e2e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
