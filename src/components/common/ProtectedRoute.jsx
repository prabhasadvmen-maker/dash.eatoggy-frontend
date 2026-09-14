import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleType = 'superadmin' }) => {
  const tokenKey = roleType === 'superadmin' 
    ? 'superadmin_token' 
    : roleType === 'admin' 
    ? 'admin_token' 
    : roleType === 'customer' 
    ? 'customer_token' 
    : roleType === 'delivery'
    ? 'delivery_token'
    : 'restaurant_token';

  const loginPath = roleType === 'superadmin' 
    ? '/superadmin/login' 
    : roleType === 'admin' 
    ? '/admin-login' 
    : roleType === 'customer' 
    ? '/user/login' 
    : roleType === 'delivery'
    ? '/delivery/login'
    : '/restaurant-login';
  
  const token = localStorage.getItem(tokenKey);
  
  if (!token) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
