import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  UtensilsCrossed, 
  CreditCard, 
  MenuSquare, 
  Bike, 
  IndianRupee, 
  Star, 
  Users, 
  MessageSquare, 
  Store, 
  Clock, 
  Bell, 
  ShieldCheck,
  Settings,
  User,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const RestaurantSidebar = ({ isOpen }) => {
  const mainNavItems = [
    { icon: <Home size={20} />, label: 'Dashboard / Overview', path: '/restaurant' },
    { icon: <ShoppingBag size={20} />, label: 'Orders', path: '/restaurant/orders' },
    { icon: <UtensilsCrossed size={20} />, label: 'Kitchen / Production', path: '/restaurant/kitchen' },
    { icon: <CreditCard size={20} />, label: 'Subscriptions', path: '/restaurant/subscriptions' },
    { icon: <MenuSquare size={20} />, label: 'Menu Management', path: '/restaurant/menu' },
    { icon: <Bike size={20} />, label: 'Delivery & Pickup', path: '/restaurant/delivery' },
    { icon: <IndianRupee size={20} />, label: 'Earnings / Payouts', path: '/restaurant/earnings' },
    { icon: <Star size={20} />, label: 'Reviews & Ratings', path: '/restaurant/reviews' },
    { icon: <Users size={20} />, label: 'Staff Management', path: '/restaurant/staff' },
    { icon: <MessageSquare size={20} />, label: 'Support', path: '/restaurant/support' },
  ];

  const settingsNavItems = [
    { icon: <Store size={20} />, label: 'Restaurant Profile', path: '/restaurant/profile-details' },
    { icon: <Clock size={20} />, label: 'Operating Hours', path: '/restaurant/hours' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/restaurant/notifications' },
    { icon: <ShieldCheck size={20} />, label: 'Security', path: '/restaurant/security' },
  ];

  const bottomNavItems = [
    { icon: <Settings size={20} />, label: 'Settings', path: '/restaurant/settings' },
    { icon: <User size={20} />, label: 'Profile', path: '/restaurant/profile' },
    { icon: <HelpCircle size={20} />, label: 'Help Center', path: '/restaurant/help' }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.path === '/restaurant'}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
        ${isActive 
          ? 'bg-[#d4af37]/10 text-[#d4af37]' 
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
        }
        ${!isOpen && 'lg:justify-center lg:px-0'}
      `}
      title={!isOpen ? item.label : ''}
    >
      {({ isActive }) => (
        <>
          <div className={`${isActive ? 'text-[#d4af37]' : 'text-gray-400 group-hover:text-gray-300'}`}>
            {item.icon}
          </div>
          
          {(isOpen || window.innerWidth < 1024) && (
            <span className="font-medium whitespace-nowrap text-sm flex-1">{item.label}</span>
          )}

          {(isOpen || window.innerWidth < 1024) && isActive && (
            <ChevronRight size={16} className="text-[#d4af37] opacity-70" />
          )}
          
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#d4af37] rounded-r-full" />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <aside 
      className={`
        ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'} 
        bg-[#0a0a0a] text-white flex flex-col h-screen sticky top-0 border-r border-[#d4af37]/10 transition-all duration-300 ease-in-out shrink-0 overflow-hidden z-20
      `}
    >
      {/* Logo Section */}
      <div className="h-16 sm:h-16 flex items-center justify-center border-b border-[#d4af37]/10 shrink-0 px-4">
        <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
          <img src="/Eatoggy%20logo.jpeg" alt="Eatoggy" className="w-8 h-8 rounded-full border-2 border-[#d4af37]/50" />
          {(isOpen || window.innerWidth < 1024) && (
            <span className="text-lg font-bold tracking-wider text-white">
              EATOGGY <span className="text-[#d4af37] text-xs align-top">PARTNER</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="px-4 space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
          
          {(isOpen || window.innerWidth < 1024) && (
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Additional Settings</p>
            </div>
          )}
          
          {settingsNavItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-[#d4af37]/10 shrink-0 bg-[#0a0a0a]">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default RestaurantSidebar;
