import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import RestaurantSidebar from '../../components/restaurant/RestaurantSidebar';
import Header from '../../components/common/Header';

const RestaurantDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <RestaurantSidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} roleType="restaurant" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RestaurantDashboardLayout;
