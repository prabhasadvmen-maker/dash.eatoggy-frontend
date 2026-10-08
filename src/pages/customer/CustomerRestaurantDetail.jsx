import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiscoveryRestaurantById, getDiscoveryRestaurantMenu } from '../../services/customer/customerDiscoveryService.js';
import { useCart } from '../../context/CartContext.jsx';
import CustomerFoodDetailModal from '../../components/customer/CustomerFoodDetailModal.jsx';
import {
  UtensilsCrossed,
  MapPin,
  Clock,
  Star,
  ArrowLeft,
  Search,
  ShoppingCart,
  ShoppingBag,
  ChevronRight,
  Info,
  Plus,
  Minus
} from 'lucide-react';

const CustomerRestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, actionLoading } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);

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
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <UtensilsCrossed size={48} className="text-[#d4af37] animate-bounce mb-4" />
        <h2 className="text-xl font-bold">Loading Menu...</h2>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <Info size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6 text-center max-w-sm">{error || 'Restaurant not available'}</p>
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
  // Get items to display with robust fallback
  const displayItems = (currentSubcategory?.items && currentSubcategory.items.length > 0)
    ? currentSubcategory.items
    : (currentCategory?.items || currentCategory?.subcategories?.flatMap(s => s.items || []) || []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <main className="flex-1 max-w-5xl mx-auto w-full pb-20">
        
        <div className="bg-transparent/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between mb-2 rounded-t-2xl">
          <button
            onClick={() => navigate('/user/home')}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
              <Search size={18} className="text-gray-700" />
            </button>
          </div>
        </div>
        {/* Restaurant Info Cover */}
        <div className="relative h-64 md:h-80 bg-white">
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
          
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <span className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold rounded-full border border-[#d4af37]/30 uppercase tracking-wider mb-3 inline-block">
              {restaurant.restaurantType || 'Cloud Kitchen'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">
              {restaurant.restaurantName}
            </h1>
            <p className="text-gray-700 mb-4 flex items-center gap-2 text-sm">
              <span className="truncate max-w-xs">{restaurant.cuisine || 'Multi-Cuisine'}</span>
              <span>•</span>
              <span className="truncate max-w-xs">{restaurant.city || 'Local'}</span>
            </p>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 text-gray-700">
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
        <div className="px-6 py-6 sticky top-[65px] bg-transparent z-20 border-b border-gray-100/50">
          {menuData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">This restaurant hasn't added any menu items yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Tabs */}
              <div className="flex overflow-x-auto gap-3 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {menuData.map(category => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryChange(category._id)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                      activeCategory === category._id
                        ? 'bg-[#d4af37] text-slate-950 shadow-md'
                        : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Subcategory Pills */}
              {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
                <div className="flex overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {currentCategory.subcategories.map(subcat => (
                    <button
                      key={subcat._id}
                      onClick={() => setActiveSubcategory(subcat._id)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSubcategory === subcat._id
                          ? 'bg-slate-100 text-slate-900'
                          : 'bg-gray-50/50 text-gray-500 hover:bg-gray-50 border border-gray-200/50'
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
            <div className="text-center py-12 bg-white/30 rounded-2xl border border-gray-100/50">
              <UtensilsCrossed size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No items available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayItems.map(item => (
                <div
                  key={item._id}
                  onClick={() => setSelectedFoodItem(item)}
                  className="bg-white border-b border-gray-100 p-5 flex gap-4 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  data-testid="menu-item-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                        item.foodType === 'VEG' ? 'border-emerald-600' : 'border-red-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          item.foodType === 'VEG' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}></div>
                      </div>
                      {item.preparationTime && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                          {item.preparationTime} mins
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-[#d4af37] transition-colors">
                      {item.name}
                    </h3>
                    
                    <div className="text-[15px] font-black text-gray-900 mb-2">
                      ₹{item.price}
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed max-w-[90%]">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Image & Add Button Column */}
                  <div className="relative shrink-0 flex flex-col items-center w-[120px]">
                    <div className="w-[120px] h-[120px] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed size={28} className="text-gray-300" />
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
                            <div className="flex items-center justify-between bg-white border border-[#d4af37] text-[#d4af37] rounded-xl overflow-hidden shadow-lg w-24 h-9" data-testid="cart-qty-control">
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
                                <Minus size={16} />
                              </button>
                              <span className="w-1/3 text-center font-black text-sm text-gray-900" data-testid="item-qty">{currentQty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item._id, currentQty + 1);
                                }}
                                disabled={actionLoading}
                                className="w-1/3 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold cursor-pointer disabled:opacity-50"
                              >
                                <Plus size={16} />
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
                            className="px-6 h-9 bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50 rounded-xl text-[13px] font-black shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[96px]"
                            data-testid="add-to-cart-btn"
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
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart?.items?.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40" data-testid="floating-cart-bar">
          <div className="bg-gradient-to-r from-amber-600 to-[#d4af37] text-slate-950 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-400/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-transparent/20 rounded-xl flex items-center justify-center text-slate-950 font-black">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900/80">
                  {cart.items.reduce((sum, i) => sum + i.quantity, 0)} Items Added
                </p>
                <p className="text-lg font-black leading-tight text-slate-950">
                  ₹{cart.subtotal}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/user/cart')}
              className="px-5 py-2.5 bg-transparent text-[#d4af37] hover:bg-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              data-testid="view-cart-btn"
            >
              <span>View Box</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Food Detail Modal */}
      {selectedFoodItem && (
        <CustomerFoodDetailModal
          item={selectedFoodItem}
          restaurantName={restaurant?.restaurantName}
          onClose={() => setSelectedFoodItem(null)}
        />
      )}
    </div>
  );
};

export default CustomerRestaurantDetail;
