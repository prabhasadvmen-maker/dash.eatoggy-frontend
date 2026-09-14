import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerGetMe } from '../../services/customerAuthService.js';
import {
  LayoutDashboard,
  Home,
  UtensilsCrossed,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Tags,
  Bell,
  UserCircle,
  MenuSquare,
  Settings,
  HelpCircle,
  LogOut,
  IndianRupee,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Menu,
  ChevronDown,
  RefreshCw,
  Gift,
  User
} from 'lucide-react';
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

const mainNavItems = [
  { id: 'home', label: 'Dashboard / Overview', icon: LayoutDashboard, emoji: '🏠' },
  { id: 'menu', label: 'Menu / Meals', icon: UtensilsCrossed, emoji: '🍱' },
  { id: 'cart', label: 'Cart', icon: ShoppingCart, emoji: '🛒' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, emoji: '📦' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, emoji: '🔄' },
  { id: 'offers', label: 'Offers & Coupons', icon: Tags, emoji: '🎁' },
  { id: 'notifications', label: 'Notifications', icon: Bell, emoji: '🔔' },
  { id: 'profile', label: 'Profile', icon: UserCircle, emoji: '👤' },
];

const bottomNavItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help Center', icon: HelpCircle },
];

const customerStatCards = [
  {
    title: 'Active Meal Plan',
    value: '1 Active',
    subtitle: 'Deluxe Thali (Lunch 1:30 PM)',
    icon: UtensilsCrossed,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Eatoggy Cash Balance',
    value: '₹250',
    subtitle: 'Available wallet cash',
    icon: IndianRupee,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    title: 'Total Orders Delivered',
    value: '14',
    subtitle: 'Across 5 cloud kitchens',
    icon: ShoppingBag,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Saved Delivery Addresses',
    value: '2 Saved',
    subtitle: 'Home (Sector 53) & Office',
    icon: MapPin,
    color: 'text-[#d4af37]',
    bgColor: 'bg-[#d4af37]/20',
  },
];

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

const recentOrdersList = [
  { id: 'ORD-9821', item: 'Deluxe North Indian Thali', kitchen: 'Urban Spice Kitchen', date: '01 Sep 2026, 1:15 PM', status: 'In Transit', amount: '₹149' },
  { id: 'ORD-9740', item: 'Paneer Butter Masala + 4 Roti', kitchen: 'Royal Punjabi Dhaba', date: '31 Aug 2026, 8:30 PM', status: 'Delivered', amount: '₹199' },
  { id: 'ORD-9612', item: 'High Protein Quinoa Salad Bowl', kitchen: 'Healthy Fit Bowl', date: '29 Aug 2026, 1:30 PM', status: 'Delivered', amount: '₹179' },
  { id: 'ORD-9504', item: 'South Indian Idli Sambhar Combo', kitchen: 'South Express Tiffin', date: '27 Aug 2026, 9:00 AM', status: 'Delivered', amount: '₹120' },
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
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
      } catch (err) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        navigate('/user/login');
      }
    };
    fetchCustomerProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    navigate('/user/login');
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* --- SLEEK DARK SIDEBAR (Matching Admin / Kitchen Dashboard) --- */}
      <aside
        className={`${
          sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
        } bg-[#0a0a0a] text-white flex flex-col h-screen sticky top-0 border-r border-neutral-900 transition-all duration-300 ease-in-out shrink-0 z-30`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-gray-800 flex items-center ${!sidebarOpen ? 'justify-center lg:px-2' : ''}`}>
          <div className="overflow-hidden whitespace-nowrap w-full">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 overflow-hidden border border-[#d4af37]/30">
                  <img src="/Eatoggy%20logo.jpeg" alt="Eatoggy Logo" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex flex-col text-left">
                  <h1 className="text-lg font-bold tracking-wider leading-tight text-white flex items-center gap-1.5">
                    EATOGGY <span className="text-[10px] text-[#d4af37] font-semibold tracking-widest uppercase">CUSTOMER</span>
                  </h1>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex w-full justify-center">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 overflow-hidden border border-[#d4af37]/30">
                  <img src="/Eatoggy%20logo.jpeg" alt="E" className="w-full h-full object-contain p-1" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav className={`space-y-1 ${sidebarOpen ? 'px-3' : 'px-2'}`}>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200 cursor-pointer text-xs font-semibold ${
                    sidebarOpen ? 'px-4' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-bold border-l-4 border-[#d4af37] shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-[#d4af37]' : 'text-gray-400'} />
                  {sidebarOpen && (
                    <span className="truncate flex-1 text-left flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.id !== 'home' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-gray-400 font-normal">
                          Soon
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="my-4 border-t border-neutral-900 mx-3" />

          {/* Bottom Nav Items */}
          <div className={`space-y-1 ${sidebarOpen ? 'px-3' : 'px-2'}`}>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200 cursor-pointer text-xs font-semibold ${
                    sidebarOpen ? 'px-4' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-bold border-l-4 border-[#d4af37]'
                      : 'text-gray-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon size={20} className="text-gray-400" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* --- MAIN DASHBOARD WRAPPER --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- TOP HEADER BAR --- */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-xs z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <MapPin size={14} className="text-[#d4af37]" />
              <span>Delivering to: <strong className="text-gray-800 font-semibold">Sector 53, Golf Course Rd, Gurugram</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title="User Profile Menu"
                className="flex items-center gap-3 p-1.5 pl-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
              >
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-gray-900 leading-none">{user?.name || 'Customer User'}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{user?.email || 'customer@eatoggy.com'}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1e1e2e] text-[#d4af37] font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <ChevronDown size={14} className="text-gray-400 mr-1" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 animate-fadeIn text-xs">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900">{user?.name || 'Rahul Sharma'}</p>
                    <p className="text-gray-400 text-[11px] truncate">{user?.email || 'rahul.sharma434@gmail.com'}</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium cursor-pointer"
                  >
                    <UserCircle size={15} /> My Profile
                  </button>
                  <button
                    onClick={() => { setActiveTab('subscriptions'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium cursor-pointer"
                  >
                    <CreditCard size={15} /> My Subscriptions
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT BODY --- */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative custom-scrollbar">
          {activeTab === 'home' ? (
            /* --- HOME (OVERVIEW) DASHBOARD --- */
            <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
              {/* Header section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
                  <p className="text-gray-500 mt-1">{currentDate}</p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Meal Plan — Lunch Arriving Soon
                </div>
              </div>

              {/* 4 Stat Cards Grid (Identical to Admin/Kitchen Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {customerStatCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition-shadow">
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

              {/* Charts Section (Area Chart & Bar Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Monthly Orders Area Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Monthly Food Orders</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Orders Delivered Trend</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">
                      Live Trend
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyOrdersData}>
                        <defs>
                          <linearGradient id="colorCustomerOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorCustomerOrders)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Monthly Spend vs Savings Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Food Spend & Savings</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Monthly Spending vs Promo Savings</p>
                    </div>
                    <span className="px-3 py-1 bg-[#d4af37]/20 text-[#a58523] text-xs font-semibold rounded-full">
                      Verified
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlySpendingData} barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                        <Bar dataKey="spend" name="Food Spend (₹)" fill="#d4af37" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="savings" name="Promo Savings (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table (Identical to Admin/Kitchen Table Style) */}
              <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Meal Orders</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Your latest food delivery and subscription history</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#d4af37] hover:underline cursor-pointer"
                  >
                    View All Orders →
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
                      {recentOrdersList.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-gray-900">{ord.id}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">{ord.item}</td>
                          <td className="px-6 py-4 text-gray-600">{ord.kitchen}</td>
                          <td className="px-6 py-4 text-gray-400 text-xs">{ord.date}</td>
                          <td className="px-6 py-4 font-extrabold text-gray-900">{ord.amount}</td>
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
          ) : (
            /* --- COMING SOON VIEW FOR OTHER 7 TABS --- */
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs animate-fadeIn">
              <div className="w-20 h-20 bg-[#d4af37]/15 rounded-2xl border border-[#d4af37]/30 flex items-center justify-center text-3xl mb-4 shadow-xs">
                {mainNavItems.find(t => t.id === activeTab)?.emoji || '🚀'}
              </div>
              <span className="px-3 py-1 bg-amber-50 text-[#a58523] text-xs font-bold rounded-full mb-3 uppercase tracking-wider border border-amber-200">
                Coming Soon
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {mainNavItems.find(t => t.id === activeTab)?.label || bottomNavItems.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500 text-sm max-w-md mb-6">
                This feature is currently under active development. You will soon be able to manage your <span className="font-semibold text-gray-800">{mainNavItems.find(t => t.id === activeTab)?.label}</span> seamlessly from your dashboard!
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="px-6 py-2.5 bg-[#1e1e2e] text-[#d4af37] font-bold text-xs rounded-xl hover:bg-black transition-colors shadow-sm cursor-pointer"
              >
                ← Back to Dashboard Overview
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;
