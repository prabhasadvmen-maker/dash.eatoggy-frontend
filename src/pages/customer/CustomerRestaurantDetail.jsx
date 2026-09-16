import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiscoveryRestaurantById, getDiscoveryRestaurantMenu } from '../../services/customer/customerDiscoveryService.js';
import {
  UtensilsCrossed,
  MapPin,
  Clock,
  Star,
  ArrowLeft,
  Search,
  ShoppingCart,
  ChevronRight,
  Info
} from 'lucide-react';

const CustomerRestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        
        // Fetch Restaurant Details
        const resDetail = await getDiscoveryRestaurantById(id);
        if (resDetail.ok && resDetail.data.success) {
          setRestaurant(resDetail.data.data);
        } else {
          setError(resDetail.data.message || 'Restaurant not found');
          setLoading(false);
          return;
        }

        // Fetch Menu
        const resMenu = await getDiscoveryRestaurantMenu(id);
        if (resMenu.ok && resMenu.data.success) {
          const menu = resMenu.data.data;
          setMenuData(menu);
          
          // Set default active category and subcategory if data exists
          if (menu.length > 0) {
            setActiveCategory(menu[0]._id);
            if (menu[0].subcategories && menu[0].subcategories.length > 0) {
              setActiveSubcategory(menu[0].subcategories[0]._id);
            }
          }
        }
        
      } catch (err) {
        setError('Failed to fetch restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [id]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    const category = menuData.find(c => c._id === categoryId);
    if (category && category.subcategories && category.subcategories.length > 0) {
      setActiveSubcategory(category.subcategories[0]._id);
    } else {
      setActiveSubcategory(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <UtensilsCrossed size={48} className="text-[#d4af37] animate-bounce mb-4" />
        <h2 className="text-xl font-bold">Loading Menu...</h2>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 px-4">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <Info size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-slate-400 mb-6 text-center max-w-sm">{error || 'Restaurant not available'}</p>
        <button
          onClick={() => navigate('/user/home')}
          className="px-6 py-2 bg-[#d4af37] text-slate-950 font-bold rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Get active category object
  const currentCategory = menuData.find(c => c._id === activeCategory);
  // Get active subcategory object
  const currentSubcategory = currentCategory?.subcategories?.find(s => s._id === activeSubcategory);
  // Get items to display
  const displayItems = currentSubcategory?.items || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/user/home')}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer">
            <Search size={18} className="text-slate-300" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full pb-20">
        {/* Restaurant Info Cover */}
        <div className="relative h-64 md:h-80 bg-slate-900">
          {restaurant.documents?.restaurantImage ? (
            <img
              src={restaurant.documents.restaurantImage}
              alt={restaurant.restaurantName}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20 bg-[url('https://www.transparenttextures.com/patterns/food.png')]">
              <UtensilsCrossed size={64} />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <span className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold rounded-full border border-[#d4af37]/30 uppercase tracking-wider mb-3 inline-block">
              {restaurant.restaurantType || 'Cloud Kitchen'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
              {restaurant.restaurantName}
            </h1>
            <p className="text-slate-300 mb-4 flex items-center gap-2 text-sm">
              <span className="truncate max-w-xs">{restaurant.cuisine || 'Multi-Cuisine'}</span>
              <span>•</span>
              <span className="truncate max-w-xs">{restaurant.city || 'Local'}</span>
            </p>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                <Clock size={14} className="text-[#d4af37]" />
                <span>25-30 mins</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400">
                <Star size={14} className="fill-emerald-400" />
                <span>4.5 (500+ Ratings)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <div className="px-6 py-6 sticky top-[65px] bg-slate-950 z-20 border-b border-slate-800/50">
          {menuData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">This restaurant hasn't added any menu items yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Tabs */}
              <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar hide-scroll-bar">
                {menuData.map(category => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryChange(category._id)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                      activeCategory === category._id
                        ? 'bg-[#d4af37] text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Subcategory Pills */}
              {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
                <div className="flex overflow-x-auto gap-2 pb-2 hide-scroll-bar">
                  {currentCategory.subcategories.map(subcat => (
                    <button
                      key={subcat._id}
                      onClick={() => setActiveSubcategory(subcat._id)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSubcategory === subcat._id
                          ? 'bg-slate-100 text-slate-900'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'
                      }`}
                    >
                      {subcat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu Items List */}
        <div className="p-6">
          {displayItems.length === 0 && menuData.length > 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
              <UtensilsCrossed size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No items available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayItems.map(item => (
                <div
                  key={item._id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-4 hover:border-slate-700 transition-colors group"
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                          item.foodType === 'VEG' ? 'border-emerald-500' : 'border-red-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.foodType === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        {item.preparationTime && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.preparationTime} mins
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-[#d4af37] transition-colors">
                        {item.name}
                      </h3>
                      
                      <div className="text-sm font-black text-white mb-2 flex items-center">
                        <span className="text-[#d4af37] mr-0.5">₹</span>{item.price}
                      </div>
                      
                      {item.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Add to Cart Placeholder - Feature explicitly excluded in vertical slice */}
                    <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-end">
                      <button 
                        disabled 
                        className="px-6 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold border border-slate-700 opacity-50 cursor-not-allowed"
                        title="Cart functionality coming soon"
                      >
                        Add to Cart (Coming Soon)
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Image */}
                  <div className="w-32 h-32 bg-slate-800 rounded-xl overflow-hidden shrink-0 relative border border-slate-700/50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed size={24} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerRestaurantDetail;
