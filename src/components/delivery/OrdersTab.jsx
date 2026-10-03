import React, { useState, useEffect } from 'react';
import { Card, Button, StatusBadge } from '../common';
import { MapPin, Navigation, Clock, IndianRupee, Phone, CheckCircle, Package } from 'lucide-react';
import { getAvailableJobs, acceptJob, updateDeliveryStatus, verifyOtpAndComplete } from '../../services/delivery/deliveryOrderService';
import { toast } from 'react-toastify';

const OrdersTab = ({ activeJob, setActiveJob, isOnline }) => {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [otp, setOtp] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = async (isAutoRefresh = false) => {
    if (!isOnline) {
      setAvailableJobs([]);
      return;
    }
    
    try {
      if (!isAutoRefresh) setLoading(true);
      else setRefreshing(true);
      
      const response = await getAvailableJobs();
      if (response.success && response.data) {
        // Ensure data is array or extract from nested object if needed
        setAvailableJobs(Array.isArray(response.data) ? response.data : response.data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch available jobs', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    if (!activeJob) {
      fetchJobs();
    }

    // Auto refresh every 4 seconds if online and no active job
    let intervalId;
    if (isOnline && !activeJob) {
      intervalId = setInterval(() => {
        fetchJobs(true);
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline, activeJob]);

  const handleAcceptJob = async (jobId) => {
    try {
      setActionLoading(true);
      const res = await acceptJob(jobId);
      if (res.success) {
        toast.success('Job accepted successfully!');
        setActiveJob(res.data.job || res.data); // Adjust based on actual API response structure
      } else {
        toast.error(res.message || 'Failed to accept job');
        fetchJobs(); // Refresh list as it might have been taken
      }
    } catch (error) {
      toast.error('An error occurred while accepting the job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeJob) return;
    
    try {
      setActionLoading(true);
      const res = await updateDeliveryStatus(activeJob._id, newStatus);
      if (res.success) {
        toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
        setActiveJob({ ...activeJob, status: newStatus });
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
        fetchJobs();
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('An error occurred during verification');
    } finally {
      setActionLoading(false);
    }
  };

  // Render Active Job
  if (activeJob) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Active Delivery</h2>
          <StatusBadge status={activeJob.status} />
        </div>

        <Card className="p-0 overflow-hidden border-2 border-[#d4af37]">
          {/* Header Map area */}
          <div className="bg-slate-800 h-40 relative flex items-center justify-center">
             <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <Navigation size={48} className="text-[#d4af37] drop-shadow-lg z-10" />
             <div className="absolute bottom-4 left-4 z-10 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                Order #{activeJob.orderNumber || activeJob._id.substring(0, 8).toUpperCase()}
             </div>
          </div>

          <div className="p-5">
            {/* Pickup */}
            <div className="relative pl-6 pb-6 border-l-2 border-dashed border-slate-300 ml-3">
              <div className="absolute -left-[11px] top-0 bg-white p-1 rounded-full border-2 border-slate-300">
                <MapPin size={14} className="text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Pickup</h3>
              <p className="font-bold text-lg">{activeJob.restaurantName || 'Restaurant'}</p>
              <p className="text-slate-600 text-sm mb-3">{activeJob.restaurantAddress || 'Loading address...'}</p>
              
              <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(`tel:${activeJob.restaurantPhone || ''}`)}>
                <Phone size={14} className="mr-1" /> Call Restaurant
              </Button>
            </div>

            {/* Drop */}
            <div className="relative pl-6 ml-3">
              <div className="absolute -left-[11px] top-0 bg-white p-1 rounded-full border-2 border-[#d4af37]">
                <Navigation size={14} className="text-[#d4af37]" />
              </div>
              <h3 className="text-sm font-semibold text-[#d4af37] uppercase tracking-wide mb-1">Drop</h3>
              <p className="font-bold text-lg">{activeJob.customerName || 'Customer'}</p>
              <p className="text-slate-600 text-sm mb-3">{activeJob.customerAddress?.fullAddress || activeJob.deliveryAddress?.addressLine1 || 'Loading address...'}</p>
              
              <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(`tel:${activeJob.customerPhone || ''}`)}>
                <Phone size={14} className="mr-1" /> Call Customer
              </Button>
            </div>
            
            <hr className="my-5 border-slate-100" />
            
            <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Earning</p>
                <p className="text-xl font-bold text-green-600">₹{activeJob.deliveryFee || '0'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Payment</p>
                <p className="text-sm font-bold text-slate-800">{activeJob.paymentMethod || 'PREPAID'}</p>
              </div>
            </div>

            {/* Action Buttons based on status */}
            <div className="space-y-3">
              {activeJob.status === 'ACCEPTED' && (
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

              {activeJob.status === 'PICKED_UP' && (
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

              {activeJob.status === 'OUT_FOR_DELIVERY' && (
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
  }

  // Render Available Jobs
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-800">Available Jobs</h2>
        {refreshing && <span className="text-xs font-medium text-[#d4af37] flex items-center"><Clock size={12} className="mr-1 animate-spin" /> Auto-refreshing</span>}
      </div>

      {!isOnline ? (
        <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-300">
          <Power size={48} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">You are currently offline</h3>
          <p className="text-slate-500 text-sm">Go to the Home tab and switch online to start receiving delivery requests.</p>
        </Card>
      ) : loading && availableJobs.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      ) : availableJobs.length === 0 ? (
        <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-300">
          <Navigation size={48} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No jobs available</h3>
          <p className="text-slate-500 text-sm">Waiting for new delivery requests in your area. This list will update automatically.</p>
          <div className="mt-6 flex justify-center">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4af37]"></span>
            </span>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {availableJobs.map(job => (
            <Card key={job._id} className="p-4 border-l-4 border-l-[#d4af37] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                  NEW REQUEST
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600 flex items-center justify-end">
                    <IndianRupee size={16} /> {job.deliveryFee || '0'}
                  </p>
                  <p className="text-xs font-medium text-slate-500">Est. {job.distance || '2.5'} km</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <MapPin size={16} className="text-slate-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup</p>
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{job.restaurantName || 'Restaurant'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Navigation size={16} className="text-[#d4af37] mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Drop</p>
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{job.dropLocation || 'Customer Address'}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                fullWidth 
                className="bg-[#d4af37] hover:bg-[#a58523] text-white"
                onClick={() => handleAcceptJob(job._id)}
                loading={actionLoading}
              >
                Accept Job
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
