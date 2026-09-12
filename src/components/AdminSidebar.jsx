import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Wrench, 
  Briefcase, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Gift, 
  MessageSquare, 
  BarChart2, 
  Bell, 
  Settings,
  User,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const AdminSidebar = ({ isOpen }) => {
  const mainNavItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <Wrench size={20} />, label: 'Partners', path: '/admin/partners' },
    { icon: <Briefcase size={20} />, label: 'Services', path: '/admin/services' },
    { icon: <Calendar size={20} />, label: 'Bookings', path: '/admin/bookings' },
    { icon: <MapPin size={20} />, label: 'Live Tracking', path: '/admin/tracking' },
    { icon: <IndianRupee size={20} />, label: 'Finance', path: '/admin/finance' },
    { icon: <Gift size={20} />, label: 'Marketing', path: '/admin/marketing' },
    { icon: <MessageSquare size={20} />, label: 'Support', path: '/admin/support' },
    { icon: <BarChart2 size={20} />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/admin/notifications' }
  ];

  const bottomNavItems = [
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
    { icon: <User size={20} />, label: 'Profile', path: '/admin/profile' },
    { icon: <HelpCircle size={20} />, label: 'Help Center', path: '/admin/help' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin-login');
  };

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.path === '/admin'}
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
          <img src="/Eatoggy%20logo.jpeg" alt="Eatoggy" className="w-8 h-8 rounded-full border-2 border-[#d4af37]/50" />
          {(isOpen || window.innerWidth < 1024) && (
            <span className="text-xl font-bold tracking-wider text-white">
              EATOGGY <span className="text-[#d4af37] text-xs align-top">ADMIN</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className="px-4 space-y-1.5">
          {mainNavItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-[#d4af37]/10 shrink-0 bg-[#0a0a0a]">
        <nav className="space-y-1.5">
          {bottomNavItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
