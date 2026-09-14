import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, Phone, Check } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const steps = [
  'Owner Details',
  'Restaurant Details',
  'Documents',
  'Menu Upload',
  'Kitchen Video',
  'Bank Details',
  'Registration Fee',
  'OTP Verification'
];

const RenderFilePreview = ({ file }) => {
  if (!file) return null;

  if (file.type.startsWith('image/')) {
    return (
      <div className="mt-3 flex flex-col items-center animate-fadeIn">
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="h-24 max-h-28 max-w-full object-cover rounded-lg border border-gray-200 shadow-sm"
        />
        <p className="text-xs text-emerald-600 font-semibold truncate mt-2 max-w-[200px]">
          ✓ {file.name}
        </p>
      </div>
    );
  }

  if (file.type.startsWith('video/')) {
    return (
      <div className="mt-3 flex flex-col items-center animate-fadeIn">
        <video
          src={URL.createObjectURL(file)}
          className="h-28 max-h-32 max-w-full rounded-lg border border-gray-200 shadow-sm"
          controls
        />
        <p className="text-xs text-emerald-600 font-semibold truncate mt-2 max-w-[200px]">
          ✓ {file.name}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col items-center animate-fadeIn">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200">
        📄 PDF Document
      </div>
      <p className="text-xs text-emerald-600 font-semibold truncate mt-2 max-w-[200px]">
        ✓ {file.name}
      </p>
    </div>
  );
};

const RestaurantSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ownerName: '', mobile: '', email: '', password: '',
    restaurantName: '', restaurantType: 'Cloud Kitchen', customRestaurantType: '', cuisine: '', fullAddress: '', city: '', pincode: '',
    operatingHoursOpen: '09:00', operatingHoursClose: '22:00',
    accountHolderName: '', accountNumber: '', ifscCode: '', upiId: ''
  });

  // File State
  const [files, setFiles] = useState({
    panCard: null,
    foodLicense: null,
    idProof: null,
    restaurantImage: null,
    menu: null,
    kitchenVideo: null
  });

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Payment State
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [registrationFee, setRegistrationFee] = useState(null);

  React.useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/restaurant-auth/registration-fee`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.fee) {
            setRegistrationFee(data.fee);
          }
        }
      } catch (err) {
        console.error('Failed to fetch registration fee:', err);
      }
    };
    fetchFee();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList.length > 0) {
      setFiles(prev => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const nextStep = () => {
    setError('');
    // Basic validation before next step
    if (currentStep === 0 && (!formData.ownerName || !formData.mobile || !formData.email || !formData.password)) {
      setError('Please fill in all owner details');
      return;
    }
    if (currentStep === 1 && (!formData.restaurantName || !formData.fullAddress || !formData.city || !formData.pincode)) {
      setError('Please fill in all required restaurant details');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const [keyRes, orderRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/restaurant-auth/payment-key`),
        fetch(`${API_BASE_URL}/api/restaurant-auth/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      ]);
      const { key } = await keyRes.json();
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.message || 'Failed to create payment order');

      setRegistrationFee(order.amount / 100);

      // Handle Demo Mode or missing/invalid Razorpay Key gracefully
      if (order.isDemo || !window.Razorpay || !key || key.includes('<your') || key === 'demo_key') {
        setTimeout(async () => {
          const verifyRes = await fetch(`${API_BASE_URL}/api/restaurant-auth/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: order.orderId,
              razorpay_payment_id: `demo_pay_${Date.now()}`,
              isDemo: true
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPaymentId(verifyData.paymentId);
            setPaymentSuccess(true);
          } else {
            setError('Payment verification failed.');
          }
          setLoading(false);
        }, 800);
        return;
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Eatoggy',
        description: 'Restaurant Registration Fee',
        order_id: order.orderId,
        handler: async (response) => {
          const verifyRes = await fetch(`${API_BASE_URL}/api/restaurant-auth/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPaymentId(verifyData.paymentId);
            setPaymentSuccess(true);
          } else {
            setError('Payment verification failed. Please try again.');
          }
          setLoading(false);
        },
        prefill: { name: formData.ownerName, email: formData.email, contact: formData.mobile },
        theme: { color: '#d4af37' },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurant-auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formData.mobile })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurant-auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formData.mobile, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpVerified(true);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      setError('Please verify your mobile number first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'restaurantType' && formData[key] === 'Other') {
          submitData.append(key, formData.customRestaurantType);
        } else if (key !== 'customRestaurantType') {
          submitData.append(key, formData[key]);
        }
      });
      
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });
      submitData.append('isPhoneVerified', 'true');

      submitData.append('paymentId', paymentId);

      const res = await fetch(`${API_BASE_URL}/api/restaurant-auth/signup`, {
        method: 'POST',
        body: submitData // Fetch handles multipart/form-data boundary automatically
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error during submission');
    }
    setLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-[#d4af37]/20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your application has been submitted successfully. Our team will review your restaurant details. You will be notified once your account is approved.
          </p>
          <button
            onClick={() => navigate('/restaurant-login')}
            className="w-full bg-[#1e1e2e] text-[#d4af37] font-medium py-3 rounded-xl hover:bg-black transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-10 px-4">
      <div className="max-w-3xl w-full mx-auto">
        <div className="text-center mb-8">
          <img src="/Eatoggy%20logo.jpeg" alt="Eatoggy Logo" className="h-16 mx-auto mb-4 rounded border border-[#d4af37]/20" />
          <h1 className="text-2xl font-bold text-gray-900">Partner with Eatoggy</h1>
          <p className="text-gray-500 mt-1">Register your kitchen to start receiving orders</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center min-w-[80px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors
                ${index < currentStep ? 'bg-[#1e1e2e] text-[#d4af37]' : 
                  index === currentStep ? 'bg-[#d4af37] text-white ring-4 ring-[#d4af37]/20' : 
                  'bg-gray-200 text-gray-400'}`}
              >
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              <span className={`text-xs text-center whitespace-nowrap ${index === currentStep ? 'font-bold text-[#d4af37]' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-10">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="min-h-[300px]">
            {/* STEP 1: Owner Details */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">1. Owner Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Full Name *</label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                    <input type="tel" name="mobile" maxLength="10" value={formData.mobile} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Restaurant Details */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">2. Restaurant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant/Kitchen Name *</label>
                    <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select name="restaurantType" value={formData.restaurantType} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none bg-white">
                      <option>Cloud Kitchen</option>
                      <option>Cafe</option>
                      <option>Dine-In Restaurant</option>
                      <option>QSR / Fast Food</option>
                      <option>Food Truck</option>
                      <option>Bakery</option>
                      <option>Dessert Parlor</option>
                      <option>Sweet Shop</option>
                      <option>Bar & Pub</option>
                      <option value="Other">Add New Type (Other)</option>
                    </select>
                    {formData.restaurantType === 'Other' && (
                      <input 
                        type="text" 
                        name="customRestaurantType" 
                        placeholder="Enter your restaurant type"
                        value={formData.customRestaurantType} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-2.5 mt-2 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" 
                        autoFocus
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Speciality</label>
                    <input type="text" name="cuisine" placeholder="e.g. North Indian, Chinese" value={formData.cuisine} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                    <textarea name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} rows="2" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" name="pincode" maxLength="6" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                    <input type="time" name="operatingHoursOpen" value={formData.operatingHoursOpen} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                    <input type="time" name="operatingHoursClose" value={formData.operatingHoursClose} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Documents */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">3. Business Documents</h3>
                <p className="text-sm text-gray-500 mb-4">Please upload clear images or PDFs (Max 10MB each).</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Food / FSSAI License */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                      Food / FSSAI License
                      <input type="file" name="foodLicense" onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
                    </label>
                    {files.foodLicense ? (
                      <RenderFilePreview file={files.foodLicense} />
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Upload FSSAI License</p>
                    )}
                  </div>

                  {/* 2. PAN Card Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                      PAN Card Upload
                      <input type="file" name="panCard" onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
                    </label>
                    {files.panCard ? (
                      <RenderFilePreview file={files.panCard} />
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Upload Business/Owner PAN Card</p>
                    )}
                  </div>

                  {/* 3. ID Proof */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                      Owner ID Proof (Aadhaar/PAN)
                      <input type="file" name="idProof" onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
                    </label>
                    {files.idProof ? (
                      <RenderFilePreview file={files.idProof} />
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Upload Aadhaar or ID Proof</p>
                    )}
                  </div>

                  {/* 4. Restaurant Image */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                      Restaurant Front Image
                      <input type="file" name="restaurantImage" onChange={handleFileChange} className="hidden" accept="image/*" />
                    </label>
                    {files.restaurantImage ? (
                      <RenderFilePreview file={files.restaurantImage} />
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Upload Entrance/Front Image</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Menu Upload */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">4. Menu Upload</h3>
                <p className="text-sm text-gray-500 mb-4">Please upload a clear PDF or image of your restaurant menu.</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors max-w-lg mx-auto">
                  <Upload className="mx-auto text-gray-400 mb-4" size={40} />
                  <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                    Upload Restaurant Menu
                    <input type="file" name="menu" onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
                  </label>
                  {files.menu ? (
                    <RenderFilePreview file={files.menu} />
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">Max file size: 10MB</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Kitchen Video */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">5. Kitchen Video Upload</h3>
                <p className="text-sm text-gray-500 mb-4">Please upload a short video (under 1 min) showing your kitchen setup and hygiene standards.</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors max-w-lg mx-auto">
                  <Upload className="mx-auto text-gray-400 mb-4" size={40} />
                  <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                    Upload Kitchen Video
                    <input type="file" name="kitchenVideo" onChange={handleFileChange} className="hidden" accept="video/mp4,video/mov,video/avi" />
                  </label>
                  {files.kitchenVideo ? (
                    <RenderFilePreview file={files.kitchenVideo} />
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">MP4/MOV only. Max file size: 100MB</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: Bank Details */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">6. Bank & Payout Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                    <input type="password" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none uppercase" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (Optional)</label>
                    <input type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Registration Fee */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-fadeIn max-w-sm mx-auto text-center pt-4">
                <div className="w-16 h-16 bg-[#d4af37]/20 text-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">₹</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Registration Fee</h3>
                <p className="text-sm text-gray-500 mb-6">A one-time onboarding fee to set up your restaurant on Eatoggy.</p>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <span className="block text-sm text-gray-500 mb-1">Total Amount</span>
                  <span className="block text-4xl font-bold text-gray-900">₹{registrationFee !== null ? registrationFee : '999'}</span>
                </div>

                {!paymentSuccess ? (
                  <button 
                    onClick={handlePayment}
                    disabled={loading} 
                    className="w-full bg-[#1e1e2e] text-[#d4af37] font-medium py-3 rounded-xl hover:bg-black transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : `Pay ₹${registrationFee !== null ? registrationFee : '999'}`}
                  </button>
                ) : (
                  <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
                    Payment Successful!
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: OTP Verification */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-fadeIn max-w-sm mx-auto text-center pt-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Verify Mobile Number</h3>
                <p className="text-sm text-gray-500">We will send an OTP to <span className="font-bold text-gray-800">{formData.mobile || 'your number'}</span></p>

                {!otpSent ? (
                  <button onClick={sendOTP} disabled={loading || !formData.mobile} className="w-full bg-[#1e1e2e] text-[#d4af37] font-medium py-3 rounded-xl hover:bg-black transition-all mt-4 disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : !otpVerified ? (
                  <div className="mt-6 space-y-4">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit OTP" 
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center tracking-[0.5em] text-lg font-bold focus:ring-2 focus:ring-[#d4af37] outline-none" 
                    />
                    <button onClick={verifyOTP} disabled={loading || otp.length !== 6} className="w-full bg-[#1e1e2e] text-[#d4af37] font-medium py-3 rounded-xl hover:bg-black transition-all disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
                    Mobile Number Verified Successfully!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || loading || (currentStep === 7 && paymentSuccess)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors
                ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ChevronLeft size={20} /> Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 6 && !paymentSuccess}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!otpVerified || loading}
                className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default RestaurantSignup;
