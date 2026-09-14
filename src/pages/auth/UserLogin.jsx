import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowRight, ShieldCheck, MapPin, Navigation, RefreshCw } from 'lucide-react';
import { customerSendOtp, customerVerifyOtp } from '../../services/customerAuthService.js';
import { useLocationContext } from '../../context/LocationContext.jsx';

const UserLogin = () => {
  const navigate = useNavigate();
  const { requestLocation } = useLocationContext();

  // Step state: 'mobile' | 'otp' | 'location'
  const [step, setStep] = useState('mobile');

  // Form State
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Handle Step 1: Send OTP
  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await customerSendOtp(mobile);
      if (res.ok && res.data.success) {
        setInfoMessage('OTP sent successfully to your mobile number.');
        setStep('otp');
      } else {
        setError(res.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!mobile || !otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await customerVerifyOtp({ mobile, otp });
      if (res.ok && res.data.success) {
        // Save auth data
        localStorage.setItem('customer_token', res.data.data.token);
        localStorage.setItem('customer_user', JSON.stringify(res.data.data.customer));

        // Advance to Location Prompt step
        setStep('location');
      } else {
        setError(res.data.message || 'OTP verification failed.');
      }
    } catch (err) {
      setError('Network error while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!mobile) return;
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await customerSendOtp(mobile);
      if (res.ok && res.data.success) {
        setInfoMessage('A new OTP has been sent via SMS.');
      } else {
        setError(res.data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Network error while requesting resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Location Permission (Allow or Skip)
  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      await requestLocation();
    } catch (e) {
      // Non-blocking location capture
    } finally {
      setLoading(false);
      navigate('/user/home');
    }
  };

  const handleSkipLocation = () => {
    navigate('/user/home');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#d4af37]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl z-10 relative">
        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-14 h-14 bg-[#d4af37]/15 rounded-2xl border border-[#d4af37]/30 flex items-center justify-center mb-3 shadow-inner">
            <img src="/Eatoggy logo.jpeg" alt="Eatoggy" className="h-9 w-9 object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            Eatoggy <span className="text-[#d4af37] text-xs font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30">Customer</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Fresh Food & Daily Tiffin Subscriptions</p>
        </div>

        {/* Info Alert */}
        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0" /> {infoMessage}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <span className="shrink-0 text-sm">⚠️</span> {error}
          </div>
        )}

        {/* --- STEP 1: MOBILE ENTRY --- */}
        {step === 'mobile' && (
          <form onSubmit={handleSendOtpSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Enter your 10-Digit Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-base font-semibold focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  required
                />
                <Smartphone className="absolute right-3.5 top-3.5 text-slate-500" size={18} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We will send an OTP SMS to verify your mobile number.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length < 10}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* --- STEP 2: OTP VERIFICATION --- */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs animate-fadeIn">
            <div className="text-center bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60">
              <p className="text-slate-400 text-xs">Enter 6-digit OTP sent to</p>
              <p className="text-[#d4af37] font-bold text-base mt-0.5">{mobile}</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-center">6-Digit Mobile OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-slate-900/90 border border-[#d4af37] rounded-xl text-slate-100 text-center font-bold tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'} <ShieldCheck size={18} />
            </button>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-[#d4af37] hover:underline font-semibold cursor-pointer"
              >
                Resend OTP via SMS
              </button>

              <button
                type="button"
                onClick={() => { setStep('mobile'); setError(''); setInfoMessage(''); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ← Change Number
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 3: LOCATION PERMISSION PROMPT --- */}
        {step === 'location' && (
          <div className="space-y-5 text-center animate-fadeIn py-2">
            <div className="w-16 h-16 bg-[#d4af37]/15 rounded-full border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
              <MapPin size={32} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Enable Location Access</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Allow Eatoggy to access your device location to discover active cloud kitchens and tiffin services near you.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                <Navigation size={18} /> {loading ? 'Getting Location...' : 'Allow Location Access'}
              </button>

              <button
                type="button"
                onClick={handleSkipLocation}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-700/60 text-slate-400 hover:text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
