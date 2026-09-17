import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, ClipboardList, PackageOpen, User } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const CustomerBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();

  const navItems = [
    { name: 'Home', path: '/user/home', icon: Home },
    { name: 'Menu', path: '/user/menu', icon: Compass },
    { name: 'Box', path: '/user/cart', icon: ShoppingBag, badge: itemCount },
    { name: 'Orders', path: '/user/orders', icon: ClipboardList },
    { name: 'Profile', path: '/user/dashboard', icon: User }
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed bottom nav */}
      <div className="h-20 sm:hidden"></div>

      <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 pb-safe sm:hidden z-50">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-16 p-1 cursor-pointer transition-colors relative ${
                  isActive ? 'text-[#d4af37]' : 'text-slate-500 hover:text-slate-300'
                }`}
                data-testid={`bottom-nav-${item.name.toLowerCase()}`}
              >
                <div className={`p-1.5 rounded-xl mb-1 relative ${isActive ? 'bg-[#d4af37]/20' : 'bg-transparent'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#d4af37] text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CustomerBottomNav;
