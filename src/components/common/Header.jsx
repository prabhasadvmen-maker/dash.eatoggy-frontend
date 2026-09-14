import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar, roleType = 'superadmin' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userData = useMemo(() => {
    try {
      const userKey = roleType === 'superadmin' ? 'superadmin_user' : roleType === 'admin' ? 'admin_user' : 'restaurant_user';
      const userStr = localStorage.getItem(userKey);
      return userStr ? JSON.parse(userStr) : { email: 'admin@eatoggy.com', role: 'Admin' };
    } catch {
      return { email: 'admin@eatoggy.com', role: 'Admin' };
    }
  }, [roleType]);

  const handleLogout = () => {
    if (roleType === 'superadmin') {
      localStorage.removeItem('superadmin_token');
      localStorage.removeItem('superadmin_user');
      navigate('/superadmin/login');
    } else if (roleType === 'admin') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      navigate('/admin-login');
    } else {
      localStorage.removeItem('restaurant_token');
      localStorage.removeItem('restaurant_user');
      navigate('/restaurant-login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="text-gray-400 hover:text-gray-600 relative p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none mb-1">{userData.email || 'user@eatoggy.com'}</p>
              <p className="text-xs text-gray-500 leading-none">{userData.role || 'Admin'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shrink-0">
              {(userData.email || 'U').charAt(0).toUpperCase()}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
