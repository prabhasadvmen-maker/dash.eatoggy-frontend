import React from 'react';
import { Navigate } from 'react-router-dom';

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

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

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(tokenKey.replace('_token', '_user'));
    return <Navigate to={loginPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
