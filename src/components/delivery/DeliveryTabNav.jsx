import React from 'react';
import { Home, ClipboardList, Navigation, TrendingUp, Wallet, Clock, Bell, User, Settings } from 'lucide-react';

const DeliveryTabNav = ({ activeTab, onTabChange, mode = 'desktop' }) => {
  const tabs = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'NEW_ORDERS', label: 'New Orders', icon: ClipboardList },
    { id: 'ACTIVE_DELIVERIES', label: 'Active Deliveries', icon: Navigation },
    { id: 'EARNINGS', label: 'Earnings', icon: TrendingUp },
    { id: 'WALLET', label: 'Wallet & Payouts', icon: Wallet },
    { id: 'HISTORY', label: 'Delivery History', icon: Clock },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'PROFILE', label: 'Profile', icon: User },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  if (mode === 'mobile') {
    const mainTabs = tabs.filter(t => ['HOME', 'NEW_ORDERS', 'ACTIVE_DELIVERIES', 'EARNINGS'].includes(t.id));
    
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around px-2 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors ${
              activeTab === tab.id ? 'text-[#d4af37]' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label={tab.label}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide uppercase truncate w-full text-center px-1">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Drawer / Desktop mode
  return (
    <div className="flex flex-col w-full space-y-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center justify-between w-full py-3 px-4 rounded-xl transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-amber-50 text-[#d4af37]'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? 'text-[#d4af37]' : 'text-slate-400'} />
            <span className={`text-sm ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
          </div>
          {activeTab === tab.id && (
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default DeliveryTabNav;
