import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Smartphone, ArrowRight, ShieldCheck, Sparkles, Utensils, CheckCircle2 } from 'lucide-react';
import API_BASE_URL from '../config/api';

const UserLogin = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend-only user authentication
    setTimeout(() => {
      if (!emailOrPhone) {
        setError('Please enter your email or mobile number');
        setLoading(false);
        return;
      }

      if (loginMethod === 'password' && !password) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }

      if (loginMethod === 'otp' && otpSent && !otp) {
        setError('Please enter the 4-digit OTP');
        setLoading(false);
        return;
      }

      const mockUser = {
        id: 'cust_101',
        name: 'Rahul Sharma',
        email: emailOrPhone.includes('@') ? emailOrPhone : 'rahul.sharma@example.com',
        mobile: emailOrPhone.match(/^\d+$/) ? emailOrPhone : '9876543210',
        role: 'customer',
        walletBalance: 250
      };

      localStorage.setItem('user_token', 'mock_customer_jwt_token_2026');
      localStorage.setItem('customer_user', JSON.stringify(mockUser));
      setLoading(false);
      navigate('/user/dashboard');
    }, 600);
  };

  const handleSendOtp = () => {
    if (!emailOrPhone) {
      setError('Please enter your mobile number first');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#d4af37]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl z-10 relative">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#d4af37]/15 rounded-2xl border border-[#d4af37]/30 flex items-center justify-center mb-3 shadow-inner">
            <img src="/Eatoggy logo.jpeg" alt="Eatoggy" className="h-10 w-10 object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            Eatoggy <span className="text-[#d4af37] text-xs font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30">Customer</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5">Order Food & Daily Tiffin Subscriptions</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-700/50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setLoginMethod('password'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              loginMethod === 'password'
                ? 'bg-[#d4af37] text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('otp'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              loginMethod === 'otp'
                ? 'bg-[#d4af37] text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick OTP Login
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <span className="shrink-0 text-sm">⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              {loginMethod === 'otp' ? 'Mobile Number' : 'Email or Mobile Number'}
            </label>
            <div className="relative">
              <input
                type={loginMethod === 'otp' ? 'tel' : 'text'}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={loginMethod === 'otp' ? '9876543210' : 'rahul@example.com or 9876543210'}
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                required
              />
              <Smartphone className="absolute right-3.5 top-3 text-slate-500" size={16} />
            </div>
          </div>

          {loginMethod === 'password' ? (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-300 font-semibold">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to email/phone.'); }} className="text-[#d4af37] hover:underline text-[11px]">Forgot Password?</a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  required
                />
                <Lock className="absolute right-3.5 top-3 text-slate-500" size={16} />
              </div>
            </div>
          ) : (
            <div>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Send OTP via SMS
                </button>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-slate-300 font-semibold">Enter 4-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full px-4 py-3 bg-slate-900/90 border border-[#d4af37] rounded-xl text-slate-100 text-center font-bold tracking-widest text-base focus:outline-none"
                  />
                  <p className="text-[11px] text-emerald-400 font-medium text-center">✓ OTP sent to {emailOrPhone} (Use: 1234)</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In & Explore Food'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-slate-400 text-xs">
            Don't have an account?{' '}
            <span
              onClick={() => {
                const name = prompt('Enter your name for instant registration:');
                if (name) {
                  localStorage.setItem('user_token', 'mock_customer_jwt_token_2026');
                  localStorage.setItem('customer_user', JSON.stringify({ name, role: 'customer' }));
                  navigate('/user/dashboard');
                }
              }}
              className="text-[#d4af37] font-bold cursor-pointer hover:underline"
            >
              Quick Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
