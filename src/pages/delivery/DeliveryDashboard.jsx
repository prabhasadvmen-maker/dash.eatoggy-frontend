import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageLoader } from '../../components/common';
import DeliveryTabNav from '../../components/delivery/DeliveryTabNav';
import { getPartnerProfile, getActiveJob, getDashboardData, updatePartnerStatusData } from '../../services/delivery/deliveryOrderService';
import { Menu, X } from 'lucide-react';

// Lazy loading tabs for performance
const HomeTab = lazy(() => import('../../components/delivery/HomeTab'));
const NewOrdersTab = lazy(() => import('../../components/delivery/NewOrdersTab'));
const ActiveDeliveriesTab = lazy(() => import('../../components/delivery/ActiveDeliveriesTab'));
const EarningsTab = lazy(() => import('../../components/delivery/EarningsTab'));
const WalletTab = lazy(() => import('../../components/delivery/WalletTab'));
const HistoryTab = lazy(() => import('../../components/delivery/HistoryTab'));
const NotificationsTab = lazy(() => import('../../components/delivery/NotificationsTab'));
const ProfileTab = lazy(() => import('../../components/delivery/ProfileTab'));
const SettingsTab = lazy(() => import('../../components/delivery/SettingsTab'));

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('HOME');
  const [partner, setPartner] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        // Ensure token exists
        const token = localStorage.getItem('delivery_token') || localStorage.getItem('deliveryToken');
        if (!token) {
          navigate('/delivery/login');
          return;
        }

        // Fetch partner profile, active jobs, and dashboard data concurrently
        const [profileRes, activeJobRes, dashboardRes] = await Promise.allSettled([
          getPartnerProfile(),
          getActiveJob(),
          getDashboardData()
        ]);

        let pData = null;
        if (profileRes.status === 'fulfilled' && (profileRes.value.success || profileRes.value.data)) {
          // Account for standard response {success, data} and auth response formats
          pData = profileRes.value.data?.partner || profileRes.value.data || profileRes.value;
        }

        if (pData) {
          if (dashboardRes.status === 'fulfilled' && dashboardRes.value.success && dashboardRes.value.data) {
            const dashData = dashboardRes.value.data;
            pData = {
              ...pData,
              todaysEarnings: dashData.totalEarnings || 0,
              todaysDeliveries: dashData.completedDeliveries || 0,
              activeJobsCount: dashData.pendingDeliveries || 0,
              timeOnline: '0h 0m' // Compute if we have login timestamps, otherwise placeholder
            };
          } else {
             // Fallbacks if dashboard endpoint fails
             pData = {
               ...pData,
               todaysEarnings: 0,
               todaysDeliveries: 0,
               activeJobsCount: 0,
               timeOnline: '0h 0m'
             };
          }
          setPartner(pData);
          setIsOnline(pData.isOnline !== false && pData.isActive !== false);
        } else {
          // For demo/development if endpoint fails entirely
          setPartner({
            _id: 'DP12345',
            fullName: 'Raj Kumar',
            mobile: '9876543210',
            vehicleType: 'Two Wheeler',
            isOnline: true,
            todaysEarnings: 850,
            todaysDeliveries: 12,
            activeJobsCount: 1,
            timeOnline: '4h 30m',
            city: 'Delhi NCR'
          });
        }

        if (activeJobRes.status === 'fulfilled' && activeJobRes.value.success && activeJobRes.value.data) {
          const jobData = activeJobRes.value.data.job || activeJobRes.value.data;
          setActiveJob(jobData);
          
          // If there is an active job, default to the ACTIVE_DELIVERIES tab
          if (jobData && jobData.status) {
            setActiveTab('ACTIVE_DELIVERIES');
          }
        }
      } catch (error) {
        console.error('Dashboard init error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate]);

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      await updatePartnerStatusData(newStatus);
      setIsOnline(newStatus);
      setPartner(prev => ({ ...prev, isOnline: newStatus, isActive: newStatus }));
      toast.success(`You are now ${newStatus ? 'Online' : 'Offline'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <PageLoader message="Loading Partner Dashboard..." />;
  }

  // Fallback loader for suspense
  const TabFallback = () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]"></div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <ToastContainer position="top-center" />
      
      {/* Header for mobile - sticky top */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="mr-3 text-slate-600 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <span className="text-[#d4af37] font-bold text-xl mr-2">EATOGGY</span>
          <span className="text-slate-500 text-sm font-medium border-l border-slate-300 pl-2">Partner</span>
        </div>
        <div className="flex items-center space-x-2">
          {activeJob && (
            <span className="flex h-3 w-3 relative mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          )}
          <div 
            onClick={toggleOnlineStatus}
            className={`w-3 h-3 rounded-full cursor-pointer ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-slate-50 shadow-2xl">
            
            <div className="flex-1 h-full overflow-y-auto pb-6">
              <div className="bg-white px-6 pt-12 pb-6 rounded-b-3xl shadow-sm border-b border-slate-200 text-center relative">
                <button
                  className="absolute top-4 right-4 flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md border-4 border-white">
                  {partner?.fullName?.charAt(0) || 'D'}
                </div>
                <h3 className="font-bold text-xl text-slate-800">{partner?.fullName || 'Partner'}</h3>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#d4af37] border border-amber-100">
                  {partner?.vehicleType || 'Vehicle'}
                </div>
              </div>
              
              <div className="px-4 mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Menu</h4>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                  <DeliveryTabNav 
                    activeTab={activeTab} 
                    onTabChange={handleTabChange} 
                    mode="desktop"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-sm">
                {partner?.fullName?.charAt(0) || 'D'}
              </div>
              <h3 className="font-bold text-slate-800">{partner?.fullName || 'Partner'}</h3>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-[#d4af37] border border-amber-100">
                {partner?.vehicleType || 'Vehicle'}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
              <DeliveryTabNav 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                mode="desktop"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full pb-20 lg:pb-0">
          <Suspense fallback={<TabFallback />}>
            {activeTab === 'HOME' && (
              <HomeTab 
                partner={partner} 
                isOnline={isOnline} 
                toggleOnlineStatus={toggleOnlineStatus}
                onNavigateTab={handleTabChange} 
              />
            )}
            
            {activeTab === 'NEW_ORDERS' && (
              <NewOrdersTab 
                activeJob={activeJob} 
                setActiveJob={setActiveJob} 
                isOnline={isOnline} 
                onNavigate={handleTabChange}
              />
            )}

            {activeTab === 'ACTIVE_DELIVERIES' && (
              <ActiveDeliveriesTab 
                activeJob={activeJob} 
                setActiveJob={setActiveJob} 
                onNavigate={handleTabChange}
              />
            )}
            
            {activeTab === 'EARNINGS' && <EarningsTab />}
            {activeTab === 'WALLET' && <WalletTab />}
            {activeTab === 'HISTORY' && <HistoryTab />}
            {activeTab === 'NOTIFICATIONS' && <NotificationsTab />}
            
            {activeTab === 'PROFILE' && (
              <ProfileTab 
                partner={partner}
                setPartner={setPartner}
              />
            )}

            {activeTab === 'SETTINGS' && <SettingsTab />}
          </Suspense>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <DeliveryTabNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        mode="mobile"
      />
    </div>
  );
};

export default DeliveryDashboard;
