import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerGetMe } from '../../services/customerAuthService.js';
import { useLocationContext } from '../../context/LocationContext.jsx';
import {
  MapPin,
  Search,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  Star,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Navigation
} from 'lucide-react';

const CustomerHome = () => {
  const navigate = useNavigate();
  const { location, requestLocation, loadingLocation, locationError } = useLocationContext();
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
      } catch (err) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        navigate('/user/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    navigate('/user/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* --- TOP BRAND & LOCATION HEADER --- */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-xl border border-[#d4af37]/40 flex items-center justify-center p-1">
              <img src="/Eatoggy logo.jpeg" alt="Eatoggy" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Eatoggy <span className="text-[#d4af37] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30">Home</span>
              </h1>
              <p className="text-[11px] text-slate-400">Fresh Tiffins & Daily Meals</p>
            </div>
          </div>

          {/* Active Geolocation Bar */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 text-xs">
            <MapPin size={16} className="text-[#d4af37] shrink-0" />
            <span className="text-slate-300">
              Location:{' '}
              <strong className="text-white font-semibold">
                {location ? (location.address || `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`) : 'Location Not Set'}
              </strong>
            </span>
            <button
              onClick={requestLocation}
              disabled={loadingLocation}
              className="ml-2 px-2 py-1 bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            >
              <Navigation size={12} /> {loadingLocation ? 'Locating...' : 'Update'}
            </button>
          </div>

          {/* Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#d4af37] text-slate-950 font-bold flex items-center justify-center text-xs">
                {user?.mobile ? user.mobile.slice(-2) : 'C'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-100">{user?.mobile || 'Verified User'}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified Customer
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-40 text-xs">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="font-bold text-white">Mobile: {user?.mobile}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Role: Customer</p>
                </div>
                <button
                  onClick={() => { navigate('/user/dashboard'); setUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-300 font-medium cursor-pointer"
                >
                  <UtensilsCrossed size={14} /> My Dashboard
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO BANNER & SEARCH --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-8 rounded-3xl border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-3 z-10 relative">
            <span className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold rounded-full border border-[#d4af37]/30 uppercase tracking-wider">
              Figma Flow Verified
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Delicious Home Cooked Tiffins & Meal Subscriptions
            </h2>
            <p className="text-slate-400 text-sm">
              Discover verified cloud kitchens delivering fresh thalis, daily meal subscriptions, and healthy bowls near you.
            </p>

            {/* Mobile Location Alert Banner if missing */}
            {!location && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> Enable device location to find cloud kitchens delivering to your doorstep.
                </span>
                <button
                  onClick={requestLocation}
                  disabled={loadingLocation}
                  className="px-3 py-1 bg-[#d4af37] text-slate-950 font-bold rounded-lg hover:brightness-110 text-xs cursor-pointer"
                >
                  {loadingLocation ? 'Locating...' : 'Allow Location'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- CATEGORIES & HIGHLIGHTS --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="text-[#d4af37]" size={20} /> Popular Meal Categories
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Daily Tiffin Plan', desc: 'Monthly & Weekly Subscriptions', emoji: '🍱' },
              { title: 'North Indian Thali', desc: 'Paneer, Dal Makhani & Rotis', emoji: '🫓' },
              { title: 'South Indian Combo', desc: 'Idli, Dosa & Sambhar', emoji: '🍲' },
              { title: 'Healthy Diet Bowls', desc: 'Quinoa, Salads & Sprouts', emoji: '🥗' }
            ].map((cat, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-[#d4af37]/50 transition-all group cursor-pointer shadow-md"
              >
                <div className="text-3xl mb-3">{cat.emoji}</div>
                <h4 className="font-bold text-white text-sm group-hover:text-[#d4af37] transition-colors">
                  {cat.title}
                </h4>
                <p className="text-slate-400 text-xs mt-1">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-xs text-slate-500">
        Eatoggy Food & Tiffin Delivery © 2026. All rights reserved.
      </footer>
    </div>
  );
};

export default CustomerHome;
