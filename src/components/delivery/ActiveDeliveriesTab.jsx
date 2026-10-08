import React, { useState } from 'react';
import { Card, Button, StatusBadge } from '../common';
import { MapPin, Navigation, Phone, CheckCircle, Package } from 'lucide-react';
import { updateDeliveryStatus, verifyOtpAndComplete } from '../../services/delivery/deliveryOrderService';
import { toast } from 'react-toastify';

const ActiveDeliveriesTab = ({ activeJob, setActiveJob, onNavigate }) => {
  const [otp, setOtp] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    if (!activeJob) return;
    try {
      setActionLoading(true);
      const res = await updateDeliveryStatus(activeJob._id, newStatus);
      if (res.success) {
        toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
        setActiveJob({ ...activeJob, deliveryStatus: newStatus });
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!activeJob || !otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    try {
      setActionLoading(true);
      const res = await verifyOtpAndComplete(activeJob._id, otp);
      if (res.success) {
        toast.success('Delivery completed successfully!');
        setActiveJob(null);
        setOtp('');
        onNavigate('HOME');
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('An error occurred during verification');
    } finally {
      setActionLoading(false);
    }
  };

  if (!activeJob) {
    return (
      <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-300 animate-fadeIn">
        <Package size={48} className="mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No Active Delivery</h3>
        <p className="text-slate-500 text-sm mb-6">You don't have any ongoing deliveries right now.</p>
        <Button onClick={() => onNavigate('NEW_ORDERS')} className="bg-[#d4af37] text-white hover:bg-[#a58523]">
          Find New Orders
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Active Delivery</h2>
        <StatusBadge status={activeJob.deliveryStatus || activeJob.status} />
      </div>

      <Card className="p-0 overflow-hidden border-2 border-[#d4af37]">
        {/* Header Map area */}
        <div className="bg-slate-800 h-40 relative flex items-center justify-center">
           <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <Navigation size={48} className="text-[#d4af37] drop-shadow-lg z-10" />
           <div className="absolute bottom-4 left-4 z-10 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
              Order #{activeJob.orderNumber || activeJob._id?.substring(0, 8).toUpperCase() || 'ID'}
           </div>
        </div>

        <div className="p-5">
          {/* Pickup */}
          <div className="relative pl-6 pb-6 border-l-2 border-dashed border-slate-300 ml-3">
            <div className="absolute -left-[11px] top-0 bg-white p-1 rounded-full border-2 border-slate-300">
              <MapPin size={14} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Pickup</h3>
            <p className="font-bold text-lg">{activeJob.restaurantSnapshot?.name || 'Restaurant'}</p>
            <p className="text-slate-600 text-sm mb-3">{activeJob.restaurantSnapshot?.address || 'Loading address...'}</p>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(`tel:${activeJob.restaurantSnapshot?.mobile || ''}`)}>
              <Phone size={14} className="mr-1" /> Call Restaurant
            </Button>
          </div>

          {/* Drop */}
          <div className="relative pl-6 ml-3">
            <div className="absolute -left-[11px] top-0 bg-white p-1 rounded-full border-2 border-[#d4af37]">
              <Navigation size={14} className="text-[#d4af37]" />
            </div>
            <h3 className="text-sm font-semibold text-[#d4af37] uppercase tracking-wide mb-1">Drop</h3>
            <p className="font-bold text-lg">{activeJob.customerSnapshot?.name || 'Customer'}</p>
            <p className="text-slate-600 text-sm mb-3">{activeJob.customerSnapshot?.addressLine1 || 'Loading address...'}, {activeJob.customerSnapshot?.city || ''}</p>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(`tel:${activeJob.customerSnapshot?.mobile || ''}`)}>
              <Phone size={14} className="mr-1" /> Call Customer
            </Button>
          </div>
          
          <hr className="my-5 border-slate-100" />
          
          <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Earning</p>
              <p className="text-xl font-bold text-green-600">₹{activeJob.pricingSnapshot?.deliveryFee || '0'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Payment</p>
              <p className="text-sm font-bold text-slate-800">{activeJob.paymentMethod || 'PREPAID'}</p>
            </div>
          </div>

          {/* Action Buttons based on status */}
          <div className="space-y-3">
            {activeJob.deliveryStatus === 'ACCEPTED' && (
              <Button 
                fullWidth 
                size="lg" 
                className="bg-[#d4af37] hover:bg-[#a58523] text-white"
                onClick={() => handleUpdateStatus('PICKED_UP')}
                loading={actionLoading}
              >
                <Package className="mr-2" /> Mark as Picked Up
              </Button>
            )}

            {activeJob.deliveryStatus === 'PICKED_UP' && (
              <Button 
                fullWidth 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                loading={actionLoading}
              >
                <Navigation className="mr-2" /> Start Delivery
              </Button>
            )}

            {activeJob.deliveryStatus === 'OUT_FOR_DELIVERY' && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 text-center">Verify Delivery OTP</h4>
                <form onSubmit={handleVerifyOtp} className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Enter 4-6 digit OTP" 
                    className="flex-1 rounded-lg border-amber-300 focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                  />
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    loading={actionLoading}
                  >
                    <CheckCircle className="mr-1" /> Verify
                  </Button>
                </form>
                <p className="text-xs text-amber-600 text-center mt-2">Ask customer for the OTP shown in their app.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActiveDeliveriesTab;
