import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import UserLogin from '../pages/auth/UserLogin';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerHome from '../pages/customer/CustomerHome';
import CustomerRestaurantDetail from '../pages/customer/CustomerRestaurantDetail';
import CustomerCart from '../pages/customer/CustomerCart';
import CustomerCheckout from '../pages/customer/CustomerCheckout';
import { LocationProvider } from '../context/LocationContext';
import { CartProvider } from '../context/CartContext';

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
            <CartProvider>
              <CustomerHome />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/dashboard"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerDashboard />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/restaurant/:id"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerRestaurantDetail />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/cart"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerCart />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/checkout"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerCheckout />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route path="/user" element={<Navigate to="/user/home" replace />} />
  </>
);

export default renderCustomerRoutes;
