import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerGetMe } from '../../services/customerAuthService.js';
import { 
  getDiscoveryRestaurants, 
  searchGlobalAPI, 
  getBannersAPI, 
  getCollectionsAPI, 
  getGourmetCreationsAPI 
} from '../../services/customer/customerDiscoveryService.js';
import { useLocationContext } from '../../context/LocationContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

import CustomerFoodDetailModal from '../../components/customer/CustomerFoodDetailModal.jsx';
import {
  MapPin, Search, UtensilsCrossed, Clock, Star, LogOut, ShieldCheck, 
  ChevronDown, Navigation, Bell, X, CheckCircle, ChevronRight, ShoppingBag
} from 'lucide-react';

const CustomerHome = () => {
  const navigate = useNavigate();
  const { location, requestLocation, loadingLocation } = useLocationContext();
  const { cart, addToCart, actionLoading } = useCart();
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);

  // Data states
  const [restaurants, setRestaurants] = useState([]);
  const [banners, setBanners] = useState([]);
  const [collections, setCollections] = useState([]);
  const [gourmetItems, setGourmetItems] = useState([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ restaurants: [], menuItems: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Active collection filter
  const [activeCollection, setActiveCollection] = useState('All');

  // Carousel state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Auth
        const authRes = await customerGetMe();
        if (authRes.ok && authRes.data.success) {
          setUser(authRes.data.data.customer);
          localStorage.setItem('customer_user', JSON.stringify(authRes.data.data.customer));
        } else {
          handleLogout();
          return;
        }

        // Fetch home data concurrently
        const [restRes, bannerRes, colRes, gourRes] = await Promise.all([
          getDiscoveryRestaurants(),
          getBannersAPI(),
          getCollectionsAPI(),
          getGourmetCreationsAPI()
        ]);

        if (restRes.ok && restRes.data.success) setRestaurants(restRes.data.data);
        if (bannerRes.ok && bannerRes.data.success) setBanners(bannerRes.data.data);
        if (colRes.ok && colRes.data.success) setCollections(colRes.data.data);
        if (gourRes.ok && gourRes.data.success) setGourmetItems(gourRes.data.data);

      } catch (err) {
        console.error(err);
        setError('Failed to load home data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  // Carousel Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Handle Search Debounce
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults({ restaurants: [], menuItems: [] });
      setShowSearchResults(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    setIsSearching(true);
    setShowSearchResults(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchGlobalAPI(searchQuery);
        if (res.ok && res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    navigate('/user/login');
  };

  // Filter gourmet items by active collection
  const filteredGourmet = activeCollection === 'All' 
    ? gourmetItems 
    : gourmetItems.filter(item => item.categoryId === activeCollection || item?.category?.name === activeCollection);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#d4af37] mt-4 font-bold text-sm">Loading Eatoggy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-6 pt-4 px-4 relative z-10">
        
        {/* Search Bar */}
        <div className="relative z-30 mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 text-gray-500" size={18} />
            <input
              type="text"
              data-testid="home-search"
              placeholder="Search for meals, restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 text-gray-500 hover:text-gray-900">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50 p-2 text-sm">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : (
                <>
                  {searchResults.restaurants.length === 0 && searchResults.menuItems.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No results found for "{searchQuery}"</div>
                  )}

                  {searchResults.restaurants.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2 mb-1">Restaurants</h4>
                      {searchResults.restaurants.map(rest => (
                        <div 
                          key={rest._id}
                          onClick={() => navigate(`/user/restaurant/${rest._id}`)}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            {rest.documents?.restaurantImage ? (
                              <img src={rest.documents.restaurantImage} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=500&fit=crop"; }} />
                            ) : <UtensilsCrossed size={20} className="text-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{rest.restaurantName}</p>
                            <p className="text-xs text-gray-500 truncate">{rest.cuisine}</p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.menuItems.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2 mb-1">Meals & Foods</h4>
                      {searchResults.menuItems.map(item => (
                        <div 
                          key={item._id}
                          onClick={() => navigate(`/user/restaurant/${item.restaurantId?._id}`)}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop"; }} />
                            ) : <UtensilsCrossed size={20} className="text-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate">₹{item.price} • {item.restaurantId?.restaurantName}</p>
                          </div>
                          <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-900 rounded font-bold">Menu</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        
        {/* --- HERO CAROUSEL --- */}
        {banners.length > 0 ? (
          <div className="relative w-full aspect-[21/9] sm:aspect-[21/6] bg-white rounded-3xl overflow-hidden shadow-xl" data-testid="hero-carousel">
            {banners.map((banner, idx) => (
              <div 
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent flex flex-col justify-center p-6 sm:p-10">
                  {banner.badge && (
                    <span className="px-2 py-1 bg-[#d4af37] text-slate-950 text-[10px] font-black uppercase tracking-wider rounded w-max mb-2">
                      {banner.badge}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2 leading-tight max-w-[70%]">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="text-gray-700 text-xs sm:text-sm max-w-[60%] mb-4 line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                  <button className="bg-white text-slate-950 px-4 py-2 rounded-xl text-xs font-bold w-max shadow-lg hover:bg-slate-200 transition-colors cursor-pointer">
                    {banner.ctaText || 'Explore Now'}
                  </button>
                </div>
              </div>
            ))}
            {/* Pagination Indicators */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {banners.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentBannerIndex ? 'w-6 bg-[#d4af37]' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Fallback Hero if no banners */
          <div className="bg-gradient-to-r from-white via-slate-900 to-amber-950/40 p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl" data-testid="hero-carousel">
            <span className="px-2 py-1 bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold rounded uppercase tracking-wider">Welcome</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 leading-tight">Fresh Food & Daily Tiffins</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1.5 max-w-md">Discover verified cloud kitchens delivering healthy meals near you.</p>
          </div>
        )}

        {/* --- CURATED COLLECTIONS --- */}
        {collections.length > 0 && (
          <div className="space-y-3" data-testid="curated-collections">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 px-1">Curated Collections</h3>
            <div className="flex overflow-x-auto custom-scrollbar gap-3 pb-4 px-1">
              <button 
                onClick={() => setActiveCollection('All')}
                className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  activeCollection === 'All' 
                  ? 'bg-[#d4af37] border-[#d4af37] text-slate-950 shadow-md shadow-[#d4af37]/20' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-slate-500'
                }`}
                data-testid="collection-chip"
              >
                All Meals
              </button>
              {collections.map(col => (
                <button
                  key={col._id}
                  onClick={() => setActiveCollection(col.name)}
                  className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    activeCollection === col.name 
                    ? 'bg-[#d4af37] border-[#d4af37] text-slate-950 shadow-md shadow-[#d4af37]/20' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-slate-500'
                  }`}
                  data-testid="collection-chip"
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- GOURMET CREATIONS --- */}
        {gourmetItems.length > 0 && (
          <div className="space-y-3" data-testid="gourmet-creations">
            <div className="flex justify-between items-end px-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Gourmet Creations</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Top picks for you</p>
              </div>
              <button className="text-[#d4af37] text-xs font-bold hover:underline cursor-pointer flex items-center gap-0.5" data-testid="view-all-gourmet">
                View All <ChevronRight size={14}/>
              </button>
            </div>
            
            {filteredGourmet.length > 0 ? (
              <div className="flex overflow-x-auto custom-scrollbar gap-5 pb-6 px-1 pt-2">
                {filteredGourmet.map(item => (
                  <div 
                    key={item._id} 
                    onClick={() => setSelectedFoodItem(item)}
                    className="w-[280px] shrink-0 bg-white border border-gray-100 p-4 rounded-3xl flex gap-4 hover:shadow-xl hover:border-[#d4af37]/30 transition-all cursor-pointer" 
                    data-testid="gourmet-card"
                  >
                    {/* Left: Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          item.foodType === 'VEG' ? 'border-emerald-600' : 'border-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            item.foodType === 'VEG' ? 'bg-emerald-600' : 'bg-red-600'
                          }`}></div>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{item.name}</h4>
                      <div className="text-[15px] font-black text-gray-900 mb-1">₹{item.price}</div>
                      <p className="text-[10px] text-gray-500 mt-auto truncate flex items-center gap-1 bg-gray-50 w-max px-2 py-1 rounded-md">
                        <UtensilsCrossed size={10} className="text-[#d4af37]" /> {item.restaurantId?.restaurantName}
                      </p>
                    </div>

                    {/* Right: Image & Button */}
                    <div className="relative shrink-0 flex flex-col items-center w-[100px]">
                      <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed size={20} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute -bottom-3 z-10" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const cartItem = cart?.items?.find(
                            ci => ci.menuItemId === item._id || ci.menuItemId?._id === item._id
                          );
                          const currentQty = cartItem ? cartItem.quantity : 0;

                          if (currentQty > 0) {
                            return (
                              <div className="flex items-center justify-between bg-white border border-[#d4af37] text-[#d4af37] rounded-xl overflow-hidden shadow-lg w-20 h-8">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentQty <= 1) {
                                      removeFromCart(item._id);
                                    } else {
                                      updateQuantity(item._id, currentQty - 1);
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="w-1/3 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold cursor-pointer disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="w-1/3 text-center font-black text-xs text-gray-900">{currentQty}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item._id, currentQty + 1);
                                  }}
                                  disabled={actionLoading}
                                  className="w-1/3 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold cursor-pointer disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item._id, 1);
                              }}
                              disabled={actionLoading}
                              className="px-4 h-8 bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50 rounded-xl text-[11px] font-black shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                            >
                              ADD
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400 text-xs bg-white border border-gray-100 rounded-2xl">
                No gourmet items available in this collection.
              </div>
            )}
          </div>
        )}

        {/* --- RESTAURANTS NEAR YOU --- */}
        <div className="space-y-4 pb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5 px-1">
            <Star className="text-[#d4af37]" size={18} /> Restaurants Near You
          </h3>

          {restaurants.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
              <UtensilsCrossed size={32} className="mx-auto mb-3 text-gray-300" />
              <h4 className="text-gray-900 font-bold mb-1">No Restaurants Found</h4>
              <p className="text-gray-500 text-xs px-4">There are currently no approved restaurants delivering in this location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {restaurants.map(rest => (
                <div
                  key={rest._id}
                  onClick={() => navigate(`/user/restaurant/${rest._id}`)}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-[#d4af37]/40 transition-all cursor-pointer group shadow-lg flex flex-col"
                  data-testid="restaurant-card"
                >
                  <div className="h-44 sm:h-48 relative overflow-hidden bg-gray-50">
                    {rest.documents?.restaurantImage ? (
                      <img src={rest.documents.restaurantImage} alt={rest.restaurantName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=500&fit=crop"; }} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-300 bg-gray-50">
                        <UtensilsCrossed size={32} className="mb-2 opacity-40"/>
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                    {rest.cuisine && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-gray-900 text-[9px] font-bold rounded uppercase tracking-wider border border-white/10">
                        {rest.cuisine}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-lg font-black text-gray-900 group-hover:text-[#d4af37] transition-colors truncate pr-2">{rest.restaurantName}</h4>
                      <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded shadow-sm text-[10px] font-bold shrink-0">
                        <Star size={10} className="fill-emerald-400" /> {rest.rating || '4.5'}
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-xs truncate mb-4">
                      {rest.restaurantType || 'Cloud Kitchen'} • {rest.city || 'Local'}
                    </p>
                    
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                        <Clock size={12} className="text-[#d4af37]" />
                        <span>25-30 mins</span>
                      </div>
                      <span className="text-[#d4af37] group-hover:underline">View Menu →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart?.items?.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-40" data-testid="home-floating-cart">
          <div className="bg-gradient-to-r from-amber-600 to-[#d4af37] text-slate-950 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-400/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-transparent/20 rounded-xl flex items-center justify-center text-slate-950 font-black">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900/80">
                  {cart.items.reduce((sum, i) => sum + i.quantity, 0)} Items In Box
                </p>
                <p className="text-base font-black leading-tight text-slate-950">
                  ₹{cart.subtotal}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/user/cart')}
              className="px-4 py-2 bg-transparent text-[#d4af37] hover:bg-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-md"
              data-testid="home-view-cart-btn"
            >
              <span>View Box</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Food Detail Modal */}
      {selectedFoodItem && (
        <CustomerFoodDetailModal
          item={selectedFoodItem}
          restaurantName={selectedFoodItem.restaurantId?.restaurantName}
          onClose={() => setSelectedFoodItem(null)}
        />
      )}

      
    </div>
  );
};

export default CustomerHome;
