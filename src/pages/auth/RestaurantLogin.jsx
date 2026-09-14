import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../services/apiService';

const RestaurantLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurant-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('restaurant_token', data.token);
        localStorage.setItem('restaurant_user', JSON.stringify(data.user));
        navigate('/restaurant');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error connecting to server');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/Eatoggy%20logo.jpeg" alt="Eatoggy Logo" className="h-16 mb-2 object-contain rounded" />
          <h2 className="text-xl font-bold text-gray-800">Restaurant Partner Portal</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your kitchen</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
              placeholder="kitchen@eatoggy.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
              <span className="mt-0.5 text-lg leading-none">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e1e2e] text-[#d4af37] font-medium py-2.5 rounded-lg hover:bg-black focus:ring-4 focus:ring-[#1e1e2e]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In as Partner'}
          </button>
          
          <div className="text-center mt-4 text-sm text-gray-600">
            Don't have an account? <span onClick={() => navigate('/restaurant-signup')} className="text-[#d4af37] font-bold cursor-pointer hover:underline">Sign Up</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantLogin;
