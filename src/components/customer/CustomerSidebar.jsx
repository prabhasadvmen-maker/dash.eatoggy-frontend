import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Settings,
  HelpCircle,
  MapPin,
  Calendar,
  ChevronRight
} from 'lucide-react';

const mainNavItems = [
  { id: 1,   label: 'Dashboard',       path: '/user/dashboard',     icon: <LayoutDashboard size={20} /> },
  { id: 2,   label: 'Discover Food',   path: '/user/home',          icon: <Home size={20} /> },
  { id: 3,   label: 'Tiffin Plans',    path: '/user/tiffin-plans',  icon: <Calendar size={20} /> },
  { id: 4,   label: 'My Cart',         path: '/user/cart',          icon: <ShoppingCart size={20} /> },
  { id: 5,   label: 'My Orders',       path: '/user/orders',        icon: <ShoppingBag size={20} /> },
  { id: 6,   label: 'Subscriptions',   path: '/user/subscriptions', icon: <CreditCard size={20} /> },
  { id: 7,   label: 'Offers & Coupons',path: '/user/offers',        icon: <Tags size={20} /> },
  { id: 8,   label: 'Notifications',   path: '/user/notifications', icon: <Bell size={20} /> },
  { id: 9,   label: 'My Addresses',    path: '/user/addresses',     icon: <MapPin size={20} /> },
];

const bottomNavItems = [
  { id: 'profile',  label: 'Profile',     path: '/user/profile',  icon: <UserCircle size={20} /> },
  { id: 'settings', label: 'Settings',    path: '/user/settings', icon: <Settings size={20} /> },
  { id: 'help',     label: 'Help Center', path: '/user/help',     icon: <HelpCircle size={20} /> },
];

const CustomerSidebar = ({ isOpen }) => {

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.path === '/user/dashboard'}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
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
            <span className="font-medium whitespace-nowrap flex-1">{item.label}</span>
          )}

          {(isOpen || window.innerWidth < 1024) && isActive && (
            <ChevronRight size={16} className="text-[#d4af37] opacity-70" />
          )}
          
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#d4af37] rounded-r-full" />
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
          <img src="/Eatoggy%20logo.jpeg" alt="Eatoggy" className="w-8 h-8 rounded-full border-2 border-[#d4af37]/50 object-contain p-0.5 bg-black" />
          {(isOpen || window.innerWidth < 1024) && (
            <span className="text-xl font-bold tracking-wider text-white">
              EATOGGY <span className="text-[#d4af37] text-xs align-top">USER</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className="px-4 space-y-1.5">
          {mainNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-[#d4af37]/10 shrink-0 bg-[#0a0a0a]">
        <nav className="space-y-1.5">
          {bottomNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default CustomerSidebar;

