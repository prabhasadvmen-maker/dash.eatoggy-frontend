import React from 'react';
import { Outlet } from 'react-router-dom';

const DeliveryDashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <main className="pb-24 lg:pb-8 lg:pt-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default DeliveryDashboardLayout;
