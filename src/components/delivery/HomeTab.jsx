import React, { useState } from 'react';
import { Card, Button } from '../common';
import { Power, CheckCircle, Navigation, Clock, ClipboardList } from 'lucide-react';

const HomeTab = ({ partner, isOnline, toggleOnlineStatus, onNavigateTab }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleOnlineStatus();
    setIsToggling(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-[#d4af37] opacity-20 rounded-full blur-3xl"></div>
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back, {partner?.fullName?.split(' ')[0] || 'Partner'}</h2>
              <p className="text-slate-300 flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>Vehicle: {partner?.vehicleType || 'Two Wheeler'}</span>
              </p>
            </div>
            
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
                isOnline 
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' 
                  : 'bg-slate-600 hover:bg-slate-500 shadow-slate-900/30'
              }`}
            >
              <Power size={24} className={isToggling ? 'animate-pulse' : ''} />
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-[#d4af37]">
          <p className="text-slate-500 text-sm font-medium mb-1">Today's Earnings</p>
          <p className="text-2xl font-bold text-slate-800">₹{partner?.todaysEarnings || '0'}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-slate-500 text-sm font-medium mb-1">Deliveries Today</p>
          <p className="text-2xl font-bold text-slate-800">{partner?.todaysDeliveries || '0'}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-slate-500 text-sm font-medium mb-1">Active Jobs</p>
          <p className="text-2xl font-bold text-slate-800">{partner?.activeJobsCount || '0'}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-slate-500 text-sm font-medium mb-1">Time Online</p>
          <p className="text-2xl font-bold text-slate-800">{partner?.timeOnline || '0h 0m'}</p>
        </Card>
      </div>

      {/* Location / Map Placeholder */}
      <Card className="p-0 overflow-hidden border-slate-200 h-64 relative group cursor-pointer" onClick={() => onNavigateTab('ORDERS')}>
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          {/* A proper map component would go here */}
          <div className="text-center">
            <Navigation size={40} className="mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 font-medium">Waiting for location data...</p>
          </div>
        </div>
        
        {/* Map Overlay HUD */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
          <div className="flex justify-between items-end">
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">Current Zone</p>
              <p className="font-bold">{partner?.city || 'Detecting Location...'}</p>
            </div>
            {isOnline && (
              <div className="flex space-x-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-white text-xs font-medium">Searching for jobs</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button 
          onClick={() => onNavigateTab('ORDERS')}
          className="w-full py-4 text-lg bg-[#d4af37] hover:bg-[#a58523] text-white border-0"
        >
          <ClipboardList className="mr-2" /> Find Available Jobs
        </Button>
        <Button 
          variant="outline"
          onClick={() => onNavigateTab('HISTORY')}
          className="w-full py-4 text-lg border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          <CheckCircle className="mr-2" /> View Completed
        </Button>
      </div>
    </div>
  );
};

export default HomeTab;
