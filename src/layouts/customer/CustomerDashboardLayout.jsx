import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from '../../components/customer/CustomerSidebar';
import Header from '../../components/common/Header';
import { LocationProvider } from '../../context/LocationContext';
import { CartProvider } from '../../context/CartContext';

const CustomerDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <LocationProvider>
      <CartProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
          <CustomerSidebar isOpen={isSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} roleType="customer" />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </CartProvider>
    </LocationProvider>
  );
};

export default CustomerDashboardLayout;
