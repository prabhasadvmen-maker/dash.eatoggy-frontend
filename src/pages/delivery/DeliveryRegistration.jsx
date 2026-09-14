import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deliverySendOtp, deliveryVerifyOtp } from '../../services/delivery/deliveryAuthService';
import { Bike, Smartphone, KeyRound, ArrowRight } from 'lucide-react';
import { Button, Input, Alert, Card } from '../../components/common';

const DeliveryRegistration = () => {
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
      const res = await deliverySendOtp(mobile);
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
      const res = await deliveryVerifyOtp({ mobile, otp });
      if (!res.ok) {
        setError(res.data.message || 'OTP verification failed');
        setLoading(false);
        return;
      }

      const { token, partner } = res.data.data;
      localStorage.setItem('delivery_token', token);
      localStorage.setItem('delivery_partner', JSON.stringify(partner));
      setSuccess('OTP Verified successfully!');

      setTimeout(() => {
        if (partner?.onboardingStatus === 'APPROVED' && partner?.isActive) {
          navigate('/delivery/home');
        } else {
          navigate('/delivery/onboarding');
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
              <Bike className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Partner Registration</h1>
            <p className="text-xs text-slate-500 mt-1">Start your onboarding process with EATOGGY</p>
          </div>

          {error && <Alert type="error" className="mb-6" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert type="success" className="mb-6" onClose={() => setSuccess('')}>{success}</Alert>}

          {step === 'MOBILE' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <Input
                label="Mobile Number"
                type="tel"
                id="delivery-reg-mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                leftIcon={Smartphone}
                required
              />

              <Button
                type="submit"
                id="delivery-send-otp-btn"
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
                id="delivery-reg-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength={6}
                leftIcon={KeyRound}
                inputClassName="tracking-widest text-center text-lg"
                helperText={<>Code sent to <span className="text-slate-900 font-bold">{mobile}</span></>}
                required
              />

              <Button
                type="submit"
                id="delivery-verify-otp-btn"
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
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 mt-2 font-medium transition-all"
              >
                Change Mobile Number
              </button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/delivery/login"
                id="delivery-login-link"
                className="text-[#a58523] hover:text-[#886d1b] font-bold underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryRegistration;
