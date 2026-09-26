import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  CreditCard,
  MenuSquare,
  Banknote,
  Undo2,
  Landmark,
  Tags,
  Star,
  MessageSquareWarning,
  BarChart3,
  Settings,
  UserCircle,
  HelpCircle,
  ImageIcon
} from 'lucide-react';

const mainNavItems = [
  { id: 1, label: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
  { id: 2, label: 'Admins & Roles', path: '/superadmin/admins-roles', icon: Users },
  { id: 3, label: 'Customers', path: '/superadmin/customers', icon: UserSquare2 },
  { id: 4, label: 'Restaurants / Kitchens', path: '/superadmin/restaurants', icon: UtensilsCrossed },
  { id: 5, label: 'Delivery Partners', path: '/superadmin/delivery-partners', icon: Bike },
  { id: 6, label: 'Orders', path: '/superadmin/orders', icon: ShoppingBag },
  { id: 7, label: 'Subscriptions', path: '/superadmin/subscriptions', icon: CreditCard },
  { id: 8, label: 'Categories (Menu)', path: '/superadmin/menu-management/categories', icon: MenuSquare },
  { id: 8.1, label: 'Subcategories (Menu)', path: '/superadmin/menu-management/subcategories', icon: MenuSquare },
  { id: 8.2, label: 'Menu Verification', path: '/superadmin/menu-management/verification', icon: MenuSquare },
  { id: 9, label: 'Payments', path: '/superadmin/payments', icon: Banknote },
  { id: 10, label: 'Refunds', path: '/superadmin/refunds', icon: Undo2 },
  { id: 11, label: 'Settlements', path: '/superadmin/settlements', icon: Landmark },
  { id: 12, label: 'Coupons & Offers', path: '/superadmin/coupons', icon: Tags },
  { id: 13, label: 'Reviews & Ratings', path: '/superadmin/reviews', icon: Star },
  { id: 13.5, label: 'Banners', path: '/superadmin/banners', icon: ImageIcon },
  { id: 14, label: 'Support & Complaints', path: '/superadmin/support', icon: MessageSquareWarning },
  { id: 15, label: 'Reports & Analytics', path: '/superadmin/reports', icon: BarChart3 },
];

const bottomNavItems = [
  { id: 'profile', label: 'Profile', path: '/superadmin/profile', icon: UserCircle },
  { id: 'settings', label: 'Settings', path: '/superadmin/settings', icon: Settings },
  { id: 'help', label: 'Help', path: '/superadmin/help', icon: HelpCircle },
];

const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`${
        isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
      } bg-[#0a0a0a] text-white flex flex-col h-screen sticky top-0 border-r border-neutral-900 transition-all duration-300 ease-in-out`}
    >
      <div className={`p-4 border-b border-gray-800 flex items-center ${!isOpen ? 'justify-center lg:px-2' : ''}`}>
        <div className="overflow-hidden whitespace-nowrap w-full">
          {isOpen ? (
             <div className="flex items-center gap-3 w-full">
               <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0 overflow-hidden border border-[#d4af37]/30">
                 <img src="/Eatoggy%20logo.jpeg" alt="Eatoggy Logo" className="w-full h-full object-contain p-1" />
               </div>
               <div className="flex flex-col text-left">
                 <h1 className="text-xl font-bold tracking-wider leading-tight text-white">EATOGGY</h1>
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">SuperAdmin</p>
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

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className={`space-y-1 ${isOpen ? 'px-3' : 'px-2'}`}>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/superadmin'}
                title={!isOpen ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isOpen ? 'px-4' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-[#d4af37]/15 text-[#d4af37]'
                      : 'text-neutral-400 hover:bg-[#d4af37]/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="py-4 border-t border-gray-800">
        <nav className={`space-y-1 ${isOpen ? 'px-3' : 'px-2'}`}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                title={!isOpen ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isOpen ? 'px-4' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-[#d4af37]/15 text-[#d4af37]'
                      : 'text-neutral-400 hover:bg-[#d4af37]/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
