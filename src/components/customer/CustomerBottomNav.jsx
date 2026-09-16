import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, ClipboardList, PackageOpen, User } from 'lucide-react';

const CustomerBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/user/home', icon: Home },
    { name: 'Menu', path: '/user/menu', icon: Compass },
    { name: 'Orders', path: '/user/orders', icon: ClipboardList },
    { name: 'Subscription', path: '/user/subscription', icon: PackageOpen },
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
                className={`flex flex-col items-center justify-center w-16 p-1 cursor-pointer transition-colors ${
                  isActive ? 'text-[#d4af37]' : 'text-slate-500 hover:text-slate-300'
                }`}
                data-testid={`bottom-nav-${item.name.toLowerCase()}`}
              >
                <div className={`p-1.5 rounded-xl mb-1 ${isActive ? 'bg-[#d4af37]/20' : 'bg-transparent'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
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
