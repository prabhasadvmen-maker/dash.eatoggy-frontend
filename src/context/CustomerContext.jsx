import React, { createContext, useContext, useEffect } from 'react';
import { useCustomerAuth } from '../hooks/customer/useCustomerAuth.js';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const { profile, isLoadingProfile, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Force redirect to login if unauthorized
      if (location.pathname.startsWith('/customer/')) {
        navigate('/login');
      }
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate, location]);

  return (
    <CustomerContext.Provider
      value={{
        customer: profile,
        isAuthenticated: !!profile,
        isLoading: isLoadingProfile,
        logout
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
