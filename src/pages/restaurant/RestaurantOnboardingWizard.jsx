import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../services/restaurant/restaurantAuthService';
import {
  updateBusinessDetails,
  uploadKitchenHygiene,
  uploadBusinessDocs,
  updateIdentityBank,
  getRegistrationFee,
  createPaymentOrder,
  verifyPayment,
  submitApplication,
  getRazorpayKey
} from '../../services/restaurant/restaurantOnboardingService';
import {
  Store, Camera, FileText, CreditCard, ShieldCheck, CheckCircle2,
  Check, Upload, ArrowRight, LogOut, Phone
} from 'lucide-react';
import { Button, Input, Card, PageHeader, PageLoader, Alert } from '../../components/common';

const RestaurantOnboardingWizard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active step index: 
  // 0: Business Details
  // 1: Kitchen Hygiene Proof
  // 2: Business Docs (GST, FSSAI)
  // 3: Identity & Bank
  // 4: Review & Payment
  // 5: Status (Pending Review)
  const [activeStep, setActiveStep] = useState(0);

  // Fee state
  const [feeInfo, setFeeInfo] = useState({ fee: 999, currency: 'INR' });
  const [paymentDone, setPaymentDone] = useState(false);

  // Form states
  const [businessData, setBusinessData] = useState({
    ownerName: '',
    restaurantName: '',
    restaurantType: 'Cloud Kitchen',
    cuisine: '',
    email: '',
    fullAddress: '',
    city: '',
    pincode: '',
    operatingHoursOpen: '09:00',
    operatingHoursClose: '22:00'
  });

  const [docFiles, setDocFiles] = useState({
    gstCertificate: null,
    foodLicense: null
  });

  const [hygieneFiles, setHygieneFiles] = useState({
    mainPrepStation: null,
    storageAndFridge: null,
    dishwashingArea: null
  });

  const [idBankData, setIdBankData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: ''
  });
  
  const [idFiles, setIdFiles] = useState({
    aadhaarFront: null,
    aadhaarBack: null
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const meRes = await getMe();
      if (!meRes.ok) {
        navigate('/restaurant-login');
        return;
      }

      const p = meRes.data?.user || meRes.data?.data?.restaurant || meRes.data?.data;
      setPartner(p);

      // Pre-fill business form
      setBusinessData({
        ownerName: p.ownerName || '',
        restaurantName: p.restaurantName || '',
        restaurantType: p.restaurantType || 'Cloud Kitchen',
        cuisine: p.cuisine || '',
        email: p.email || '',
        fullAddress: p.fullAddress || '',
        city: p.city || '',
        pincode: p.pincode || '',
        operatingHoursOpen: p.operatingHours?.open || '09:00',
        operatingHoursClose: p.operatingHours?.close || '22:00'
      });

      if (p.bankDetails) {
        setIdBankData({
          accountHolderName: p.bankDetails.accountHolderName || '',
          accountNumber: '', // For security, we don't pre-fill account number fully
          confirmAccountNumber: '',
          ifscCode: p.bankDetails.ifscCode || '',
          bankName: p.bankDetails.bankName || ''
        });
      }

      // Check Fee
      const feeRes = await getRegistrationFee();
      if (feeRes.ok && feeRes.data?.data) {
        setFeeInfo(feeRes.data.data);
      }

      // Route if approved
      if (p.onboardingStatus === 'APPROVED' || p.status === 'APPROVED') {
        navigate('/restaurant');
        return;
      }

      // Determine starting step based on backend currentStep
      if (['PENDING_REVIEW', 'APPROVED', 'REJECTED'].includes(p.onboardingStatus)) {
        setActiveStep(4);
      } else if (p.currentStep) {
        const stepMap = {
          'WELCOME': 0,
          'DRAFT': 0,
          'ONBOARDING_IN_PROGRESS': 0,
          'BUSINESS_DETAILS': 0,
          'KITCHEN_HYGIENE': 1,
          'BUSINESS_DOCS': 2,
          'IDENTITY_BANK': 3,
          'REVIEW_PAYMENT': 4,
          'PENDING_REVIEW': 5
        };
        if (stepMap[p.currentStep] !== undefined) {
          setActiveStep(stepMap[p.currentStep]);
        } else if (['PENDING_REVIEW', 'APPROVED', 'REJECTED'].includes(p.onboardingStatus)) {
          setActiveStep(5);
        }
      }
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 0: Business Details ---
  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await updateBusinessDetails(businessData);
      if (!res.ok) {
        setError(res.data.message || 'Failed to save business details');
        setActionLoading(false);
        return;
      }
      setSuccess('Business details saved successfully!');
      setActiveStep(1);
    } catch (err) {
      setError(err.message || 'Error updating business details');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 1: Kitchen Hygiene Proof ---
  const handleUploadKitchenHygiene = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!hygieneFiles.mainPrepStation && !partner?.kitchenHygieneProof?.mainPrepStation?.url) {
      setError('Please upload Main Prep Station media');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      if (hygieneFiles.mainPrepStation) formData.append('mainPrepStation', hygieneFiles.mainPrepStation);
      if (hygieneFiles.storageAndFridge) formData.append('storageAndFridge', hygieneFiles.storageAndFridge);
      if (hygieneFiles.dishwashingArea) formData.append('dishwashingArea', hygieneFiles.dishwashingArea);

      const res = await uploadKitchenHygiene(formData);
      if (!res.ok) {
        setError(res.data.message || 'Failed to upload hygiene proof');
        setActionLoading(false);
        return;
      }

      setSuccess('Kitchen hygiene proof uploaded successfully!');
      setActiveStep(2);
    } catch (err) {
      setError(err.message || 'Error uploading hygiene proof');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 2: Business Docs ---
  const handleUploadBusinessDocs = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!docFiles.gstCertificate || !docFiles.foodLicense) {
      // Check if backend already has them
      if (!partner?.documents?.gstCertificate || !partner?.documents?.foodLicense) {
        setError('Please upload both GST Certificate and FSSAI Food License');
        return;
      }
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      if (docFiles.gstCertificate) formData.append('gstCertificate', docFiles.gstCertificate);
      if (docFiles.foodLicense) formData.append('foodLicense', docFiles.foodLicense);

      const res = await uploadBusinessDocs(formData);
      if (!res.ok) {
        setError(res.data.message || 'Failed to upload business docs');
        setActionLoading(false);
        return;
      }

      setSuccess('Business documents uploaded successfully!');
      setActiveStep(3);
    } catch (err) {
      setError(err.message || 'Error uploading business docs');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 2: Identity & Bank ---
  const handleSaveIdentityBank = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (idBankData.accountNumber !== idBankData.confirmAccountNumber) {
      setError('Account numbers do not match');
      return;
    }

    if (!idFiles.aadhaarFront || !idFiles.aadhaarBack) {
      if (!partner?.documents?.aadhaarFront || !partner?.documents?.aadhaarBack) {
        setError('Please upload both Aadhaar Front and Back');
        return;
      }
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('accountHolderName', idBankData.accountHolderName);
      formData.append('accountNumber', idBankData.accountNumber);
      formData.append('ifscCode', idBankData.ifscCode);
      formData.append('bankName', idBankData.bankName);
      
      if (idFiles.aadhaarFront) formData.append('aadhaarFront', idFiles.aadhaarFront);
      if (idFiles.aadhaarBack) formData.append('aadhaarBack', idFiles.aadhaarBack);

      const res = await updateIdentityBank(formData);
      if (!res.ok) {
        setError(res.data.message || 'Failed to save identity & bank details');
        setActionLoading(false);
        return;
      }

      setSuccess('Identity & Bank details saved successfully!');
      setActiveStep(4);
    } catch (err) {
      setError(err.message || 'Error saving identity & bank details');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Step 3: Payment ---
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

      const { orderId, amount, isDemo } = orderRes.data;
      
      const keyRes = await getRegistrationFee();
      const rzpKeyRes = await getRazorpayKey();
      const key = rzpKeyRes?.data?.data?.key || rzpKeyRes?.data?.key;
      
      const isMockKey = isDemo || !key || key === 'demo_key' || key.includes('<your') || orderId.startsWith('demo_order_');

      if (window.Razorpay && !window.EATOGGY_TEST_MODE && !isMockKey) {
        const options = {
          key: key,
          amount: amount,
          currency: 'INR',
          name: 'EATOGGY',
          description: 'Restaurant Partner Onboarding Fee',
          order_id: orderId,
          handler: async (response) => {
            await verifyAndSubmitPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              false
            );
          },
          modal: {
            ondismiss: () => {
              setActionLoading(false);
            }
          },
          prefill: {
            name: businessData.ownerName,
            email: businessData.email,
            contact: partner?.mobile
          },
          theme: { color: '#d4af37' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function () {
            setError('Payment failed. Please try again.');
        });
        rzp.open();
      } else {
        // Fallback demo mock
        const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
        const mockSig = 'sig_' + Math.random().toString(36).substring(2, 12);
        await verifyAndSubmitPayment(orderId, mockPaymentId, mockSig, true);
      }
    } catch (err) {
      setError(err.message || 'Payment initiation error');
      setActionLoading(false);
    }
  };

  const verifyAndSubmitPayment = async (orderId, paymentId, signature, isDemo) => {
    try {
      const verifyRes = await verifyPayment({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        isDemo
      });

      if (!verifyRes.ok) {
        setError(verifyRes.data.message || 'Payment signature verification failed');
        setActionLoading(false);
        return;
      }

      setPaymentDone(true);
      setSuccess('Payment verified successfully!');

      // Automatically Submit Application
      const submitRes = await submitApplication();
      if (submitRes.ok) {
        setActiveStep(5);
      } else {
        setError(submitRes.data.message || 'Failed to submit onboarding');
      }
    } catch (err) {
      setError(err.message || 'Payment verification error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading Onboarding Wizard..." />;
  }

  const steps = [
    { title: 'Business', icon: Store },
    { title: 'Hygiene', icon: Camera },
    { title: 'Documents', icon: FileText },
    { title: 'Identity & Bank', icon: CreditCard },
    { title: 'Review & Pay', icon: ShieldCheck },
    { title: 'Status', icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Restaurant Partner Onboarding"
          description={
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#a58523]" /> 
              Verified Mobile: <span className="text-[#a58523] font-semibold">{partner?.mobile}</span>
            </span>
          }
          icon={Store}
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={() => {
                localStorage.removeItem('restaurant_token');
                localStorage.removeItem('restaurant_user');
                navigate('/restaurant-login');
              }}
            >
              Logout
            </Button>
          }
        />

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

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

        {/* STEP 0: BUSINESS DETAILS */}
        {activeStep === 0 && (
          <form onSubmit={handleSaveBusiness}>
            <Card
              header={
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#d4af37]" /> Business Details
                </h2>
              }
              footer={
                <div className="flex justify-end w-full">
                  <Button type="submit" id="onboard-business-next-btn" loading={actionLoading} icon={ArrowRight} iconPosition="right">
                    Save Details & Next
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Owner Full Name" value={businessData.ownerName} onChange={(e) => setBusinessData({ ...businessData, ownerName: e.target.value })} required />
                <Input label="Restaurant / Kitchen Name" value={businessData.restaurantName} onChange={(e) => setBusinessData({ ...businessData, restaurantName: e.target.value })} required />
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Restaurant Type *</label>
                  <select value={businessData.restaurantType} onChange={(e) => setBusinessData({ ...businessData, restaurantType: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none">
                    <option value="Cloud Kitchen">Cloud Kitchen</option>
                    <option value="Dine-In Restaurant">Dine-In Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="QSR / Fast Food">QSR / Fast Food</option>
                    <option value="Bakery">Bakery</option>
                  </select>
                </div>

                <Input label="Cuisine Speciality" value={businessData.cuisine} onChange={(e) => setBusinessData({ ...businessData, cuisine: e.target.value })} placeholder="e.g. North Indian, Chinese" />
                <Input label="Email Address" type="email" value={businessData.email} onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })} placeholder="name@example.com" />
                <div className="sm:col-span-2">
                  <Input label="Full Address" type="textarea" value={businessData.fullAddress} onChange={(e) => setBusinessData({ ...businessData, fullAddress: e.target.value })} required />
                </div>
                <Input label="City" value={businessData.city} onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })} required />
                <Input label="Pincode" value={businessData.pincode} onChange={(e) => setBusinessData({ ...businessData, pincode: e.target.value })} maxLength="6" required />
                
                <Input label="Opening Time" type="time" value={businessData.operatingHoursOpen} onChange={(e) => setBusinessData({ ...businessData, operatingHoursOpen: e.target.value })} />
                <Input label="Closing Time" type="time" value={businessData.operatingHoursClose} onChange={(e) => setBusinessData({ ...businessData, operatingHoursClose: e.target.value })} />
              </div>
            </Card>
          </form>
        )}

        {/* STEP 1: KITCHEN HYGIENE PROOF */}
        {activeStep === 1 && (
          <form onSubmit={handleUploadKitchenHygiene}>
            <Card
              header={
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#d4af37]" /> Kitchen Hygiene Proof
                </h2>
              }
              footer={
                <div className="flex justify-between w-full">
                  <Button variant="secondary" onClick={() => setActiveStep(0)}>Back</Button>
                  <Button type="submit" id="onboard-hygiene-next-btn" loading={actionLoading} icon={ArrowRight} iconPosition="right">
                    Upload & Next
                  </Button>
                </div>
              }
            >
              <div className="space-y-6">
                <p className="text-sm text-slate-600">Upload real-time media of your workspace to verify hygiene standards and get the "Verified Clean" badge.</p>
                <div className="text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800">
                  Max file size: 25MB. Accepted formats: JPG, PNG, MP4...
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Main Prep Station (Photo or Video) *</label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 transition-all">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Upload Prep Area View</span>
                    <span className="text-xs text-slate-500 mt-1 truncate max-w-full">
                      {hygieneFiles.mainPrepStation ? hygieneFiles.mainPrepStation.name : partner?.kitchenHygieneProof?.mainPrepStation?.url ? 'Already uploaded (click to replace)' : 'Choose File'}
                    </span>
                    <input type="file" accept="image/*,video/mp4" onChange={(e) => setHygieneFiles({ ...hygieneFiles, mainPrepStation: e.target.files[0] })} className="hidden" />
                  </label>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-800 mb-4">Additional Areas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Storage & Fridge</label>
                      <p className="text-xs text-slate-500 mb-2">Proper shelf order & packaging</p>
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 transition-all">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-700">Upload</span>
                        <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
                          {hygieneFiles.storageAndFridge ? hygieneFiles.storageAndFridge.name : partner?.kitchenHygieneProof?.additionalAreas?.storageAndFridge?.url ? 'Already uploaded' : 'Optional'}
                        </span>
                        <input type="file" accept="image/*,video/mp4" onChange={(e) => setHygieneFiles({ ...hygieneFiles, storageAndFridge: e.target.files[0] })} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Dishwashing Area</label>
                      <p className="text-xs text-slate-500 mb-2">Clean sinks & sanitizers</p>
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 transition-all">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-700">Upload</span>
                        <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
                          {hygieneFiles.dishwashingArea ? hygieneFiles.dishwashingArea.name : partner?.kitchenHygieneProof?.additionalAreas?.dishwashingArea?.url ? 'Already uploaded' : 'Optional'}
                        </span>
                        <input type="file" accept="image/*,video/mp4" onChange={(e) => setHygieneFiles({ ...hygieneFiles, dishwashingArea: e.target.files[0] })} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* STEP 2: BUSINESS DOCS */}
        {activeStep === 2 && (
          <form onSubmit={handleUploadBusinessDocs}>
            <Card
              header={
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#d4af37]" /> Business Documents
                </h2>
              }
              footer={
                <div className="flex justify-between w-full">
                  <Button variant="secondary" onClick={() => setActiveStep(1)}>Back</Button>
                  <Button type="submit" id="onboard-docs-next-btn" loading={actionLoading} icon={ArrowRight} iconPosition="right">
                    Upload & Next
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">GST Certificate *</label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 transition-all">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600 truncate max-w-full font-medium">
                      {docFiles.gstCertificate ? docFiles.gstCertificate.name : partner?.documents?.gstCertificate ? 'Already uploaded (click to replace)' : 'Choose File'}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setDocFiles({ ...docFiles, gstCertificate: e.target.files[0] })} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Food License (FSSAI) *</label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 transition-all">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600 truncate max-w-full font-medium">
                      {docFiles.foodLicense ? docFiles.foodLicense.name : partner?.documents?.foodLicense ? 'Already uploaded (click to replace)' : 'Choose File'}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setDocFiles({ ...docFiles, foodLicense: e.target.files[0] })} className="hidden" />
                  </label>
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* STEP 3: IDENTITY & BANK */}
        {activeStep === 3 && (
          <form onSubmit={handleSaveIdentityBank}>
            <Card
              header={
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#d4af37]" /> Identity & Bank Details
                </h2>
              }
              footer={
                <div className="flex justify-between w-full">
                  <Button variant="secondary" onClick={() => setActiveStep(2)}>Back</Button>
                  <Button type="submit" id="onboard-idbank-next-btn" loading={actionLoading} icon={ArrowRight} iconPosition="right">
                    Save & Next
                  </Button>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Aadhaar Front Image *</label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 transition-all">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 truncate font-medium">
                        {idFiles.aadhaarFront ? idFiles.aadhaarFront.name : partner?.documents?.aadhaarFront ? 'Already uploaded' : 'Choose File'}
                      </span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => setIdFiles({ ...idFiles, aadhaarFront: e.target.files[0] })} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Aadhaar Back Image *</label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#d4af37] rounded-xl cursor-pointer bg-slate-50 transition-all">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 truncate font-medium">
                        {idFiles.aadhaarBack ? idFiles.aadhaarBack.name : partner?.documents?.aadhaarBack ? 'Already uploaded' : 'Choose File'}
                      </span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => setIdFiles({ ...idFiles, aadhaarBack: e.target.files[0] })} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label="Bank Name" value={idBankData.bankName} onChange={(e) => setIdBankData({ ...idBankData, bankName: e.target.value })} required />
                  </div>
                  <Input label="Account Holder Name" value={idBankData.accountHolderName} onChange={(e) => setIdBankData({ ...idBankData, accountHolderName: e.target.value })} required />
                  <Input label="IFSC Code" value={idBankData.ifscCode} onChange={(e) => setIdBankData({ ...idBankData, ifscCode: e.target.value.toUpperCase() })} inputClassName="uppercase" required />
                  <Input label="Account Number" type="password" value={idBankData.accountNumber} onChange={(e) => setIdBankData({ ...idBankData, accountNumber: e.target.value })} required />
                  <Input label="Confirm Account Number" type="text" value={idBankData.confirmAccountNumber} onChange={(e) => setIdBankData({ ...idBankData, confirmAccountNumber: e.target.value })} required />
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* STEP 4: REVIEW & PAYMENT */}
        {activeStep === 4 && (
          <Card
            header={
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" /> Review Application & Pay
              </h2>
            }
            footer={
              <div className="flex justify-between w-full">
                <Button variant="secondary" onClick={() => setActiveStep(3)}>Back</Button>
                <Button onClick={handleStartPayment} id="onboard-pay-btn" loading={actionLoading} icon={ShieldCheck}>
                  Pay ₹{feeInfo.fee} & Submit
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-inner">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Registration Fee</span>
                <div className="text-4xl font-black text-slate-900 mt-2">
                  ₹{feeInfo.fee}
                </div>
                <p className="text-xs text-slate-500 mt-2">One-time fee to set up your restaurant on Eatoggy.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-sm text-slate-700">
                <div>
                  <h3 className="font-bold border-b pb-2 mb-2">Summary</h3>
                  <p><strong>Name:</strong> {businessData.restaurantName}</p>
                  <p><strong>Owner:</strong> {businessData.ownerName}</p>
                  <p><strong>Address:</strong> {businessData.fullAddress}, {businessData.city}</p>
                </div>
                <div>
                  <h3 className="font-bold border-b pb-2 mb-2">Kitchen Hygiene Proof</h3>
                  <p><strong>Main Prep Station:</strong> {partner?.kitchenHygieneProof?.mainPrepStation?.url ? '✓ Uploaded' : '✗ Missing'}</p>
                  <p><strong>Storage & Fridge:</strong> {partner?.kitchenHygieneProof?.additionalAreas?.storageAndFridge?.url ? '✓ Uploaded' : 'Optional / Not provided'}</p>
                  <p><strong>Dishwashing Area:</strong> {partner?.kitchenHygieneProof?.additionalAreas?.dishwashingArea?.url ? '✓ Uploaded' : 'Optional / Not provided'}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 5: STATUS */}
        {activeStep === 5 && (
          <Card>
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-50 border-2 border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Application Under Review</h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your application has been successfully submitted! Our team is reviewing your documents. 
                We will notify you once your restaurant is approved.
              </p>
              
              {partner?.rejectionReason && (
                 <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                    <strong>Rejection Reason:</strong> {partner.rejectionReason}
                    <p className="mt-2 text-xs">Please fix the issues by restarting the flow (contact support if needed).</p>
                 </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RestaurantOnboardingWizard;
