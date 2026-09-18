import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryGetMe } from '../../services/delivery/deliveryAuthService';
import {
  getAvailableJobs, getActiveJob, acceptJob,
  updateDeliveryStatus, verifyOtpAndComplete
} from '../../services/delivery/deliveryOrderService';
import { Bike, Smartphone, LogOut, Navigation, Power, CheckCircle2, ShieldCheck, MapPin, Phone, PackageCheck, AlertCircle } from 'lucide-react';
import { Card, StatusBadge, Button, PageLoader } from '../../components/common';

const DeliveryHome = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDutyActive, setIsDutyActive] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPartnerData();
  }, []);

  useEffect(() => {
    if (partner && isDutyActive) {
      loadJobs();
      const interval = setInterval(loadJobs, 4000);
      return () => clearInterval(interval);
    }
  }, [partner, isDutyActive]);

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

  const loadJobs = async () => {
    try {
      const [availRes, activeRes] = await Promise.all([
        getAvailableJobs().catch(() => ({ data: [] })),
        getActiveJob().catch(() => ({ data: null }))
      ]);

      setAvailableJobs(availRes.data || []);
      setActiveJob(activeRes.data || null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('delivery_partner');
    navigate('/delivery/login');
  };

  const handleAcceptJob = async (jobId) => {
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await acceptJob(jobId);
      setSuccessMessage('Job accepted successfully!');
      setActiveJob(res.data);
      loadJobs();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to accept job. It may have been claimed by another rider.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId, nextStatus) => {
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await updateDeliveryStatus(jobId, nextStatus);
      setSuccessMessage(`Delivery status updated to ${nextStatus}!`);
      setActiveJob(res.data);
      loadJobs();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 4) {
      setErrorMessage('Please enter the 4-digit Delivery OTP provided by customer');
      return;
    }

    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await verifyOtpAndComplete(activeJob._id, otpInput.trim());
      setSuccessMessage('Order successfully delivered! Great job.');
      setActiveJob(null);
      setOtpInput('');
      loadJobs();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Invalid Delivery OTP. Please ask customer to recheck.');
    } finally {
      setActionLoading(false);
    }
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

        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2" id="delivery-error-alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2" id="delivery-success-alert">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ACTIVE JOB DRAWER */}
        {activeJob ? (
          <Card padding="md" className="border-2 border-[#d4af37]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-[#a58523] tracking-wider block">ACTIVE DELIVERY ASSIGNMENT</span>
                <span className="text-sm font-extrabold text-slate-900" id="active-job-order-number">{activeJob.orderNumber}</span>
              </div>
              <StatusBadge status={activeJob.deliveryStatus} showIcon />
            </div>

            <div className="space-y-4">
              {/* Restaurant Snapshot */}
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">PICKUP LOCATION (RESTAURANT)</span>
                <h4 className="text-sm font-bold text-slate-900" id="active-job-restaurant-name">{activeJob.restaurantSnapshot?.name}</h4>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span id="active-job-restaurant-address">{activeJob.restaurantSnapshot?.address}</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{activeJob.restaurantSnapshot?.mobile}</span>
                </p>
              </div>

              {/* Customer Snapshot */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DROP LOCATION (CUSTOMER)</span>
                <h4 className="text-sm font-bold text-slate-900" id="active-job-customer-name">{activeJob.customerSnapshot?.name}</h4>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span id="active-job-customer-address">
                    {activeJob.customerSnapshot?.addressLine1}, {activeJob.customerSnapshot?.city} ({activeJob.customerSnapshot?.pincode})
                  </span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{activeJob.customerSnapshot?.mobile}</span>
                </p>
              </div>

              {/* Status Actions & OTP Completion */}
              <div className="pt-2 border-t border-slate-100">
                {activeJob.deliveryStatus === 'ACCEPTED' && (
                  <Button
                    variant="primary"
                    className="w-full font-bold py-3"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(activeJob._id, 'PICKED_UP')}
                    id="btn-confirm-pickup"
                  >
                    Confirm Order Pickup at Restaurant
                  </Button>
                )}

                {activeJob.deliveryStatus === 'PICKED_UP' && (
                  <Button
                    variant="primary"
                    className="w-full font-bold py-3 bg-[#d4af37] text-slate-950 hover:bg-[#b8952b]"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(activeJob._id, 'OUT_FOR_DELIVERY')}
                    id="btn-out-for-delivery"
                  >
                    Start Navigation & Out for Delivery
                  </Button>
                )}

                {activeJob.deliveryStatus === 'OUT_FOR_DELIVERY' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-3 bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900">VERIFY CUSTOMER OTP TO COMPLETE DELIVERY</span>
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="4-Digit OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        id="input-delivery-otp"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
                        id="btn-verify-otp-submit"
                      >
                        Verify & Complete
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Card>
        ) : (
          /* AVAILABLE JOBS FEED */
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>AVAILABLE DELIVERY JOBS ({availableJobs.length})</span>
              <span className="text-xs font-normal text-slate-400">Auto-refreshing...</span>
            </h3>

            {availableJobs.length === 0 ? (
              <div className="p-8 bg-amber-50/40 border border-[#d4af37]/20 rounded-2xl text-center space-y-2">
                <PackageCheck className="w-8 h-8 text-[#d4af37] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-[#a58523]">No Active Jobs Nearby</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When customers place orders and restaurants prepare them, delivery requests will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableJobs.map((job) => (
                  <Card key={job._id} padding="md" className="hover:border-[#d4af37] transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900" id={`job-order-num-${job._id}`}>{job.orderNumber}</span>
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">
                            Payout: ₹{job.pricingSnapshot?.deliveryFee || 35}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Pickup: <strong>{job.restaurantSnapshot?.name}</strong> ({job.restaurantSnapshot?.address})</span>
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Drop: {job.customerSnapshot?.city} ({job.customerSnapshot?.pincode})</span>
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleAcceptJob(job._id)}
                        className="w-full sm:w-auto font-bold bg-[#d4af37] text-slate-950 hover:bg-[#b8952b]"
                        id={`btn-accept-job-${job._id}`}
                      >
                        Accept Delivery Job
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryHome;
