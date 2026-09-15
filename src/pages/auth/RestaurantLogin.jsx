import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp, getMe } from '../../services/restaurant/restaurantAuthService';
import { Store, Smartphone, KeyRound, ArrowRight } from 'lucide-react';
import { Button, Input, Alert, Card } from '../../components/common';

const RestaurantLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('MOBILE'); // 'MOBILE' | 'OTP'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobile || mobile.trim().length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(mobile);
      if (!res.ok) {
        setError(res.data.message || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      setSuccess('OTP sent successfully!');
      setStep('OTP');
    } catch (err) {
      setError(err.message || 'Something went wrong while sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      if (!res.ok) {
        setError(res.data.message || 'OTP verification failed');
        setLoading(false);
        return;
      }

      // Fetch the full profile to know onboarding status
      const meRes = await getMe();
      if (!meRes.ok) {
        setError('Failed to fetch profile data');
        setLoading(false);
        return;
      }

      const partner = meRes.data.user;
      localStorage.setItem('restaurant_user', JSON.stringify(partner));
      setSuccess('OTP Verified successfully!');

      setTimeout(() => {
        if (partner?.onboardingStatus === 'APPROVED' && partner?.isActive) {
          navigate('/restaurant');
        } else {
          navigate('/restaurant-onboarding');
        }
      }, 500);
    } catch (err) {
      setError(err.message || 'Something went wrong verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-amber-50 border border-[#d4af37]/30 rounded-2xl flex items-center justify-center text-[#d4af37] mb-4 shadow-sm">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Restaurant Partner Login</h1>
            <p className="text-xs text-slate-500 mt-1">Access or register your EATOGGY kitchen</p>
          </div>

          {error && <Alert type="error" className="mb-6" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert type="success" className="mb-6" onClose={() => setSuccess('')}>{success}</Alert>}

          {step === 'MOBILE' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <Input
                label="Mobile Number"
                type="tel"
                id="restaurant-login-mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                leftIcon={Smartphone}
                required
              />

              <Button
                type="submit"
                id="restaurant-send-otp-btn"
                loading={loading}
                fullWidth
                icon={ArrowRight}
                iconPosition="right"
              >
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <Input
                label="Enter 6-Digit Verification Code"
                type="text"
                id="restaurant-login-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength={6}
                leftIcon={KeyRound}
                inputClassName="tracking-widest text-center text-lg font-bold"
                helperText={<>Code sent to <span className="text-slate-900 font-bold">{mobile}</span></>}
                required
              />

              <Button
                type="submit"
                id="restaurant-verify-otp-btn"
                loading={loading}
                fullWidth
                icon={ArrowRight}
                iconPosition="right"
              >
                Verify & Continue
              </Button>

              <button
                type="button"
                onClick={() => setStep('MOBILE')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 mt-2 font-medium transition-all cursor-pointer"
              >
                Change Mobile Number
              </button>
            </form>
          )}

        </Card>
      </div>
    </div>
  );
};

export default RestaurantLogin;
