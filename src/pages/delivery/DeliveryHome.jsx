import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryGetMe } from '../../services/delivery/deliveryAuthService';
import { Bike, Smartphone, LogOut, Navigation, Power } from 'lucide-react';
import { Card, StatusBadge, Button, PageLoader } from '../../components/common';

const DeliveryHome = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDutyActive, setIsDutyActive] = useState(true);

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      const res = await deliveryGetMe();
      if (!res.ok) {
        navigate('/delivery/login');
        return;
      }

      const p = res.data.data?.partner || res.data.data;
      if (p?.onboardingStatus !== 'APPROVED') {
        navigate('/delivery/onboarding');
        return;
      }

      setPartner(p);
    } catch (err) {
      navigate('/delivery/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_partner');
    navigate('/delivery/login');
  };

  if (loading) {
    return <PageLoader message="Loading Delivery Partner Dashboard..." />;
  }

  const partnerDisplayName = partner?.fullName || 'Delivery Partner';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Card */}
        <Card padding="md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-50 border border-[#d4af37]/30 rounded-2xl flex items-center justify-center text-[#d4af37] shadow-sm shrink-0">
                <Bike className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{partnerDisplayName}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{partner?.mobile}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#a58523] font-bold">{partner?.vehicleType || 'Vehicle Pending'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={isDutyActive ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => setIsDutyActive(!isDutyActive)}
                icon={Power}
                className={isDutyActive ? 'bg-amber-50 border-[#d4af37] text-[#a58523] font-bold' : ''}
              >
                {isDutyActive ? 'ONLINE / ON DUTY' : 'OFFLINE'}
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl transition-all hover:bg-slate-100"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card padding="md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Account Status</span>
            <StatusBadge status="APPROVED" customLabel="ACTIVE & APPROVED" showIcon />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold block mb-1">Operational City / Location</span>
              <p className="text-sm text-slate-900 font-medium">
                {partner?.city || '-'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold block mb-1">Selected Location</span>
              <p className="text-sm text-slate-900 font-medium truncate flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>{partner?.selectedAddress || partner?.city || 'Standard Location'}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Ready Notification Banner */}
        <div className="p-6 bg-amber-50/60 border border-[#d4af37]/30 rounded-2xl text-center space-y-2">
          <h2 className="text-lg font-bold text-[#a58523]">Ready for Orders</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your Delivery Partner onboarding is complete. When restaurant pickups begin in your area, new orders will be notified here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryHome;
