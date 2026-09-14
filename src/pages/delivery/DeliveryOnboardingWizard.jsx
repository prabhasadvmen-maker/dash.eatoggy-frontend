import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryGetMe } from '../../services/delivery/deliveryAuthService';
import {
  getOnboardingFee,
  updateProfile,
  updateLocation,
  uploadDocuments,
  updateBank,
  createPaymentOrder,
  verifyPayment,
  submitOnboarding,
  resubmitOnboarding
} from '../../services/delivery/deliveryOnboardingService';
import {
  User, FileText, CreditCard, ShieldCheck, Bike,
  Check, Upload, ArrowRight, RefreshCw, LogOut, AlertCircle, MapPin
} from 'lucide-react';
import { Button, Input, Card, PageHeader, PageLoader, Alert, StatusBadge, LocationSelector } from '../../components/common';

const DeliveryOnboardingWizard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active step index (0: Profile & Location, 1: Documents, 2: Bank, 3: Fee & Payment, 4: Status Review)
  const [activeStep, setActiveStep] = useState(0);

  // Fee state
  const [feeInfo, setFeeInfo] = useState({ amount: 499, amountPaise: 49900, currency: 'INR' });

  // Form states
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    vehicleType: 'Bike'
  });

  const [locationData, setLocationData] = useState({
    formattedAddress: '',
    selectedAddress: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null
  });

  const [docData, setDocData] = useState({
    aadhaarNumber: '',
    panNumber: ''
  });
  const [files, setFiles] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panImage: null
  });

  const [bankData, setBankData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: ''
  });

  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Load partner & fee on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Get Fee
      const feeRes = await getOnboardingFee();
      if (feeRes.ok && feeRes.data?.data) {
        setFeeInfo(feeRes.data.data);
      }

      // 2. Get Delivery Partner profile
      const meRes = await deliveryGetMe();
      if (!meRes.ok) {
        navigate('/delivery/login');
        return;
      }

      const p = meRes.data.data.partner || meRes.data.data;
      setPartner(p);

      // Pre-fill form fields
      setProfileData({
        fullName: p.fullName || '',
        email: p.email || '',
        vehicleType: p.vehicleType || 'Bike'
      });

      if (p.selectedAddress || p.city) {
        setLocationData({
          formattedAddress: p.selectedAddress || p.city || '',
          selectedAddress: p.selectedAddress || p.city || '',
          city: p.city || '',
          state: '',
          pincode: '',
          latitude: p.latitude || null,
          longitude: p.longitude || null
        });
      }

      // Route if approved
      if (p.onboardingStatus === 'APPROVED' && p.isActive) {
        navigate('/delivery/home');
        return;
      }

      // Determine starting step based on onboarding status and saved currentStep
      if (['PENDING_REVIEW', 'APPROVED', 'REJECTED'].includes(p.onboardingStatus)) {
        setActiveStep(4);
      } else if (p.onboardingStatus === 'PAYMENT_SUCCESS') {
        setActiveStep(3);
        setPaymentDone(true);
      } else if (p.currentStep) {
        const stepMap = {
          'PROFILE': 0,
          'LOCATION': 0,
          'DOCUMENTS': 1,
          'BANK_DETAILS': 2,
          'ONBOARDING_FEE': 3,
          'PAYMENT': 3,
          'PENDING_REVIEW': 4,
          'APPROVED': 4,
          'REJECTED': 4
        };
        if (stepMap[p.currentStep] !== undefined) {
          setActiveStep(stepMap[p.currentStep]);
        }
      }
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 0: Location Selector Handler ---
  const handleLocationSelect = (locObj) => {
    if (typeof locObj === 'object') {
      setLocationData({
        formattedAddress: locObj.formattedAddress || locObj.city || '',
        selectedAddress: locObj.formattedAddress || locObj.city || '',
        city: locObj.city || 'Hub City',
        state: locObj.state || '',
        pincode: locObj.pincode || '',
        latitude: locObj.latitude || null,
        longitude: locObj.longitude || null
      });
    } else {
      setLocationData((prev) => ({
        ...prev,
        formattedAddress: locObj,
        selectedAddress: locObj,
        city: locObj
      }));
    }
  };

  // --- Step 0: Save Profile (NO Operational Zone, NO Password) ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetAddress = locationData.selectedAddress || locationData.formattedAddress;

    if (!profileData.fullName) {
      setError('Please enter your full legal name');
      return;
    }

    if (!targetAddress) {
      setError('Please search and select your location/city address');
      return;
    }

    setActionLoading(true);
    try {
      const targetCity = locationData.city || targetAddress || 'Standard City';
      const targetZone = locationData.city || targetAddress || 'Standard Zone';

      // 1. Update Profile (passes zone derived from city/address to satisfy backend API validation)
      const res = await updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        city: targetCity,
        zone: targetZone,
        vehicleType: profileData.vehicleType
      });

      if (!res.ok) {
        setError(res.data.message || 'Failed to update profile');
        setActionLoading(false);
        return;
      }

      // 2. Update Location so backend currentStep advances to DOCUMENTS
      const locRes = await updateLocation({
        selectedAddress: targetAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      });

      if (locRes.ok) {
        setPartner(locRes.data.data.partner || locRes.data.data);
      } else {
        setPartner(res.data.data.partner || res.data.data);
      }

      setSuccess('Profile & location details saved successfully!');
      setActiveStep(1);
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 1: Document Upload ---
  const handleUploadDocuments = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!docData.aadhaarNumber || !docData.panNumber) {
      setError('Please enter both Aadhaar and PAN numbers');
      return;
    }

    if (!files.aadhaarFront || !files.aadhaarBack || !files.panImage) {
      setError('Please upload all required document images (Aadhaar Front, Back & PAN)');
      return;
    }

    const formData = new FormData();
    formData.append('aadhaarNumber', docData.aadhaarNumber);
    formData.append('panNumber', docData.panNumber);
    formData.append('aadhaarFront', files.aadhaarFront);
    formData.append('aadhaarBack', files.aadhaarBack);
    formData.append('panImage', files.panImage);

    setActionLoading(true);
    try {
      const res = await uploadDocuments(formData);
      if (!res.ok) {
        setError(res.data.message || 'Document upload failed');
        setActionLoading(false);
        return;
      }

      setSuccess('Documents uploaded successfully!');
      setActiveStep(2);
    } catch (err) {
      setError(err.message || 'Error uploading documents');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 2: Bank Details ---
  const handleSaveBank = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bankData.accountHolderName || !bankData.accountNumber || !bankData.ifscCode) {
      setError('Please fill in all bank details');
      return;
    }

    if (bankData.accountNumber !== bankData.confirmAccountNumber) {
      setError('Account numbers do not match');
      return;
    }

    setActionLoading(true);
    try {
      const res = await updateBank({
        accountHolderName: bankData.accountHolderName,
        accountNumber: bankData.accountNumber,
        ifscCode: bankData.ifscCode
      });

      if (!res.ok) {
        setError(res.data.message || 'Failed to save bank details');
        setActionLoading(false);
        return;
      }

      setSuccess('Bank details saved successfully!');
      setActiveStep(3);
    } catch (err) {
      setError(err.message || 'Error saving bank details');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 3: Onboarding Fee & Payment ---
  const handleStartPayment = async () => {
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const orderRes = await createPaymentOrder();
      if (!orderRes.ok) {
        setError(orderRes.data.message || 'Failed to create payment order');
        setActionLoading(false);
        return;
      }

      const { orderId, amountPaise, keyId } = orderRes.data.data;
      const razorpayOrderId = orderId || orderRes.data.data.razorpayOrderId;

      const isMockKey = !keyId || keyId === 'demo_key' || keyId === 'rzp_test_key_eatoggy' || keyId === 'placeholder' || razorpayOrderId.startsWith('order_mock_') || razorpayOrderId.startsWith('demo_order_');

      if (window.Razorpay && !window.EATOGGY_TEST_MODE && !isMockKey) {
        const options = {
          key: keyId,
          amount: amountPaise,
          currency: 'INR',
          name: 'EATOGGY',
          description: 'Delivery Partner Onboarding Fee',
          order_id: razorpayOrderId,
          handler: async (response) => {
            await verifyAndSubmitPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          modal: {
            ondismiss: () => {
              setActionLoading(false);
            }
          },
          prefill: {
            name: profileData.fullName,
            email: profileData.email,
            contact: partner?.mobile
          },
          theme: { color: '#d4af37' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function () {
          const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
          const mockSig = 'sig_' + Math.random().toString(36).substring(2, 12);
          await verifyAndSubmitPayment(razorpayOrderId, mockPaymentId, mockSig);
        });
        rzp.open();
      } else {
        const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
        const mockSig = 'sig_' + Math.random().toString(36).substring(2, 12);
        await verifyAndSubmitPayment(razorpayOrderId, mockPaymentId, mockSig);
      }
    } catch (err) {
      setError(err.message || 'Payment initiation error');
      setActionLoading(false);
    }
  };

  const verifyAndSubmitPayment = async (orderId, paymentId, signature) => {
    try {
      const verifyRes = await verifyPayment({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      });

      if (!verifyRes.ok) {
        setError(verifyRes.data.message || 'Payment signature verification failed');
        setActionLoading(false);
        return;
      }

      setPaymentDone(true);
      setPaymentDetails(verifyRes.data.data);
      setSuccess('Payment verified successfully!');

      const submitRes = await submitOnboarding();
      if (submitRes.ok) {
        setPartner(submitRes.data.data.partner || submitRes.data.data);
        setActiveStep(4);
      } else {
        setError(submitRes.data.message || 'Failed to submit onboarding');
      }
    } catch (err) {
      setError(err.message || 'Payment verification error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 4: Resubmit Application (if REJECTED) ---
  const handleResubmit = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await resubmitOnboarding();
      if (!res.ok) {
        setError(res.data.message || 'Resubmission failed');
        setActionLoading(false);
        return;
      }

      setPartner(res.data.data.partner || res.data.data);
      setSuccess('Application resubmitted successfully for review!');
    } catch (err) {
      setError(err.message || 'Error resubmitting application');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading Onboarding Wizard..." />;
  }

  const steps = [
    { title: 'Profile & Location', icon: User },
    { title: 'Documents', icon: FileText },
    { title: 'Bank', icon: CreditCard },
    { title: 'Payment', icon: ShieldCheck },
    { title: 'Status', icon: Bike }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Delivery Partner Onboarding"
          description={
            <>Mobile Verified: <span className="text-[#a58523] font-semibold">{partner?.mobile}</span></>
          }
          icon={Bike}
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={() => {
                localStorage.removeItem('delivery_token');
                navigate('/delivery/login');
              }}
            >
              Logout
            </Button>
          }
        />

        {/* Stepper Header */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s, idx) => {
            const StepIcon = s.icon;
            const isActive = activeStep === idx;
            const isDone = activeStep > idx;

            return (
              <div
                key={idx}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  isActive
                    ? 'bg-amber-50 border-[#d4af37] text-[#a58523] shadow-sm font-bold'
                    : isDone
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-sm font-bold">
                  {isDone ? <Check className="w-5 h-5 text-emerald-600" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

        {/* STEP 0: PROFILE & LOCATION SELECTOR */}
        {activeStep === 0 && (
          <form onSubmit={handleSaveProfile}>
            <Card
              header={
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#d4af37]" /> Partner Profile Details
                </h2>
              }
              footer={
                <div className="flex justify-end w-full">
                  <Button
                    type="submit"
                    id="onboard-profile-next-btn"
                    loading={actionLoading}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Save Profile & Next
                  </Button>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    id="onboard-fullname"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Enter full legal name"
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    id="onboard-email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>

                {/* Location Selector (Replaces City text input, NO Operational Zone) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <LocationSelector
                    label="Location / City"
                    id="onboard-location-search"
                    value={locationData}
                    onChange={handleLocationSelect}
                    placeholder="Search location or address..."
                    required
                  />

                  {locationData.selectedAddress && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                        Selected Address
                      </span>
                      <p className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <span>{locationData.selectedAddress}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Vehicle Type Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Vehicle Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Bike', 'Scooter', 'Car'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        id={`vehicle-type-${v.toLowerCase()}`}
                        onClick={() => setProfileData({ ...profileData, vehicleType: v })}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all shadow-sm ${
                          profileData.vehicleType === v
                            ? 'bg-amber-50 border-[#d4af37] text-[#a58523]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* STEP 1: DOCUMENTS */}
        {activeStep === 1 && (
          <form onSubmit={handleUploadDocuments}>
            <Card
              header={
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#d4af37]" /> Identity Documents Upload (Aadhaar & PAN)
                </h2>
              }
              footer={
                <div className="flex justify-between items-center w-full">
                  <Button variant="secondary" onClick={() => setActiveStep(0)}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    id="onboard-docs-next-btn"
                    loading={actionLoading}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Upload Documents & Next
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Aadhaar Number"
                    id="onboard-aadhaar-number"
                    value={docData.aadhaarNumber}
                    onChange={(e) => setDocData({ ...docData, aadhaarNumber: e.target.value })}
                    placeholder="12-digit Aadhaar Number"
                    maxLength={12}
                    required
                  />

                  <Input
                    label="PAN Number"
                    id="onboard-pan-number"
                    value={docData.panNumber}
                    onChange={(e) => setDocData({ ...docData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="10-character PAN (e.g. ABCDE1234F)"
                    maxLength={10}
                    inputClassName="uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Aadhaar Front Image *
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 hover:bg-white transition-all shadow-sm">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 truncate max-w-full font-medium">
                        {files.aadhaarFront ? files.aadhaarFront.name : 'Choose File'}
                      </span>
                      <input
                        type="file"
                        id="onboard-aadhaar-front-file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles({ ...files, aadhaarFront: e.target.files[0] })}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Aadhaar Back Image *
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 hover:bg-white transition-all shadow-sm">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 truncate max-w-full font-medium">
                        {files.aadhaarBack ? files.aadhaarBack.name : 'Choose File'}
                      </span>
                      <input
                        type="file"
                        id="onboard-aadhaar-back-file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles({ ...files, aadhaarBack: e.target.files[0] })}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      PAN Card Image *
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 hover:bg-white transition-all shadow-sm">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 truncate max-w-full font-medium">
                        {files.panImage ? files.panImage.name : 'Choose File'}
                      </span>
                      <input
                        type="file"
                        id="onboard-pan-file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles({ ...files, panImage: e.target.files[0] })}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* STEP 2: BANK DETAILS */}
        {activeStep === 2 && (
          <form onSubmit={handleSaveBank}>
            <Card
              header={
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#d4af37]" /> Payout Bank Account Details
                </h2>
              }
              footer={
                <div className="flex justify-between items-center w-full">
                  <Button variant="secondary" onClick={() => setActiveStep(1)}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    id="onboard-bank-next-btn"
                    loading={actionLoading}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Save Bank Details & Next
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Account Holder Name"
                    id="onboard-bank-name"
                    value={bankData.accountHolderName}
                    onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                    placeholder="As per bank records"
                    required
                  />
                </div>

                <Input
                  label="Account Number"
                  id="onboard-bank-acc"
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                  required
                />

                <Input
                  label="Confirm Account Number"
                  id="onboard-bank-confirm-acc"
                  value={bankData.confirmAccountNumber}
                  onChange={(e) => setBankData({ ...bankData, confirmAccountNumber: e.target.value })}
                  placeholder="Re-enter account number"
                  required
                />

                <Input
                  label="IFSC Code"
                  id="onboard-bank-ifsc"
                  value={bankData.ifscCode}
                  onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                  inputClassName="uppercase"
                  required
                />
              </div>
            </Card>
          </form>
        )}

        {/* STEP 3: ONBOARDING FEE & PAYMENT */}
        {activeStep === 3 && (
          <Card
            header={
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" /> Onboarding Fee & Razorpay Payment
              </h2>
            }
            footer={
              <div className="flex justify-between items-center w-full">
                <Button variant="secondary" onClick={() => setActiveStep(2)}>
                  Back
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-inner">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  Official Delivery Onboarding Fee
                </span>
                <div className="text-4xl font-extrabold text-[#a58523]">
                  ₹{feeInfo.amount} <span className="text-sm font-normal text-slate-500">{feeInfo.currency}</span>
                </div>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  One-time mandatory onboarding fee configured by EATOGGY Super Admin. Includes partner kit and portal authorization.
                </p>
              </div>

              {paymentDone ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-800">Payment Verified & Completed!</h3>
                  <p className="text-xs text-slate-600">
                    Razorpay Order ID: <span className="font-mono text-slate-900 font-bold">{paymentDetails?.razorpayOrderId}</span>
                  </p>
                </div>
              ) : (
                <Button
                  type="button"
                  id="pay-onboarding-fee-btn"
                  onClick={handleStartPayment}
                  loading={actionLoading}
                  fullWidth
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Pay ₹{feeInfo.amount} with Razorpay
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* STEP 4: STATUS REVIEW / SUBMISSION */}
        {activeStep === 4 && (
          <Card padding="lg" className="text-center">
            <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <Bike className="w-6 h-6 text-[#d4af37]" /> Application Status
            </h2>

            {partner?.onboardingStatus === 'PENDING_REVIEW' && (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-[#a58523] mx-auto animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-[#a58523]">Application Under Review</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your onboarding details and verified payment have been submitted. EATOGGY Super Admin is currently reviewing your document submissions.
                </p>
                <div className="pt-2">
                  <StatusBadge status="PENDING_REVIEW" showIcon size="md" />
                </div>
              </div>
            )}

            {partner?.onboardingStatus === 'APPROVED' && (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-emerald-700">Application Approved!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Congratulations! Your delivery partner account is fully verified and active.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    id="go-to-delivery-home-btn"
                    onClick={() => navigate('/delivery/home')}
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Go to Delivery Partner Home
                  </Button>
                </div>
              </div>
            )}

            {partner?.onboardingStatus === 'REJECTED' && (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-rose-700">Application Requires Revision</h3>
                <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl text-left max-w-md mx-auto">
                  <span className="text-xs uppercase text-slate-500 font-bold block mb-1">Rejection Reason:</span>
                  <p className="text-sm text-rose-800 font-medium">
                    {partner?.rejectionReason || 'Documents or profile details require correction.'}
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveStep(0)}
                  >
                    Edit Details
                  </Button>
                  <Button
                    type="button"
                    id="resubmit-onboarding-btn"
                    onClick={handleResubmit}
                    loading={actionLoading}
                  >
                    Resubmit Application
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryOnboardingWizard;
