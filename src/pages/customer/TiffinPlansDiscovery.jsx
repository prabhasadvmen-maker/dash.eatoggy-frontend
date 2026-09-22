import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicTiffinPlansAPI } from '../../services/subscription/subscriptionService.js';

import {
  Calendar,
  Search,
  ArrowLeft,
  Utensils,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Percent,
  Tag
} from 'lucide-react';

const TiffinPlansDiscovery = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMealType, setFilterMealType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlans();
  }, [filterMealType]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterMealType !== 'ALL') params.mealType = filterMealType;
      if (searchQuery) params.search = searchQuery;

      const res = await getPublicTiffinPlansAPI(params);
      if (res.ok && res.data.success) {
        setPlans(res.data.data.plans || []);
      } else {
        setError(res.data.message || 'Failed to load tiffin plans');
      }
    } catch (err) {
      setError('Error loading tiffin plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlans();
  };

  const filteredPlans = plans.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.name || p.planName || '').toLowerCase().includes(q) ||
           (p.description && p.description.toLowerCase().includes(q)) ||
           (p.restaurantId?.restaurantName && p.restaurantId.restaurantName.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-5">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/user/home')}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
              data-testid="tiffin-back-btn"
            >
              <ArrowLeft size={18} className="text-gray-900" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-[#d4af37]" />
                Tiffin Subscriptions
              </h1>
              <p className="text-xs text-gray-500">Home-style Daily Meals Scheduled for You</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/user/subscriptions')}
            className="px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] font-bold rounded-full text-xs hover:bg-[#d4af37]/20 transition-all cursor-pointer flex items-center gap-1.5"
            data-testid="my-subscriptions-btn"
          >
            <Sparkles size={14} />
            My Subscriptions
          </button>
        </div>
        {/* Search & Meal Type Filter */}
        <div className="space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search tiffin plans or restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              data-testid="tiffin-search-input"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-gray-500" />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'LUNCH', 'DINNER', 'BOTH'].map(type => (
              <button
                key={type}
                onClick={() => setFilterMealType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterMealType === type
                    ? 'bg-[#d4af37] text-slate-950 shadow-md shadow-[#d4af37]/10'
                    : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-900'
                }`}
                data-testid={`filter-${type.toLowerCase()}`}
              >
                {type === 'ALL' ? 'All Meals' : type}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#d4af37] font-bold">Finding available tiffin plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 shadow-xl" data-testid="empty-tiffin-plans">
            <Utensils size={44} className="text-gray-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">No Tiffin Plans Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No active tiffin meal plans match your selection. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4" data-testid="tiffin-plans-list">
            {filteredPlans.map(plan => {
              const totalPrice = (plan.pricePerMeal || 0) * (plan.durationDays || 1);
              return (
                <div
                  key={plan._id}
                  onClick={() => navigate(`/user/tiffin-plans/${plan._id}`)}
                  className="bg-white border border-gray-100 hover:border-[#d4af37]/50 rounded-3xl p-5 space-y-4 shadow-xl transition-all cursor-pointer group"
                  data-testid={`tiffin-plan-card-${plan._id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[#d4af37] text-[10px] font-bold rounded-full uppercase">
                          {plan.mealType}
                        </span>
                        <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-full">
                          {plan.durationDays} Days Plan
                        </span>
                        {plan.discountPercentage > 0 && (
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Tag size={10} /> Save {plan.discountPercentage}%
                          </span>
                        )}
                      </div>

                      <h2 className="text-base font-bold text-gray-900 group-hover:text-[#d4af37] transition-colors mt-2" data-testid="plan-name">
                        {plan.name || plan.planName}
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        by {plan.restaurantId?.restaurantName || 'Gourmet Kitchen'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Total Price</p>
                      <p className="text-lg font-black text-[#d4af37]" data-testid="plan-total-price">
                        ₹{totalPrice}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        ₹{plan.pricePerMeal}/meal
                      </p>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {plan.items && plan.items.length > 0 && (
                    <div className="bg-transparent/60 rounded-2xl p-3 border border-gray-100/80">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Includes Daily:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.items.map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-700 text-[11px] rounded-lg border border-gray-200">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-100/60 pt-3 text-xs">
                    <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Cutoff: {plan.cutoffTime || '09:00'}
                      </span>
                      <span>•</span>
                      <span>{plan.availableDays?.length || 7} Days / Week</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-[#d4af37] group-hover:translate-x-1 transition-transform">
                      <span>Subscribe</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      
    </div>
  );
};

export default TiffinPlansDiscovery;
