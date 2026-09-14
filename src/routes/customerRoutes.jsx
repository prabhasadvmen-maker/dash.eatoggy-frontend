import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import UserLogin from '../pages/auth/UserLogin';
import CustomerDashboard from '../pages/customer/CustomerDashboard';

export const renderCustomerRoutes = () => (
  <>
    <Route path="/user/login" element={<UserLogin />} />
    <Route path="/user/dashboard" element={<CustomerDashboard />} />
    <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
  </>
);

export default renderCustomerRoutes;
