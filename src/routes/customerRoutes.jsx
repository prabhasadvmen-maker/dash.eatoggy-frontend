import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import UserLogin from '../pages/auth/UserLogin';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerHome from '../pages/customer/CustomerHome';
import CustomerRestaurantDetail from '../pages/customer/CustomerRestaurantDetail';
import { LocationProvider } from '../context/LocationContext';

export const renderCustomerRoutes = () => (
  <>
    <Route
      path="/user/login"
      element={
        <LocationProvider>
          <UserLogin />
        </LocationProvider>
      }
    />
    <Route
      path="/user/home"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CustomerHome />
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/dashboard"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CustomerDashboard />
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/restaurant/:id"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CustomerRestaurantDetail />
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route path="/user" element={<Navigate to="/user/home" replace />} />
  </>
);

export default renderCustomerRoutes;
