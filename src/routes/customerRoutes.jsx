import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import UserLogin from '../pages/auth/UserLogin';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerHome from '../pages/customer/CustomerHome';
import CustomerRestaurantDetail from '../pages/customer/CustomerRestaurantDetail';
import CustomerCart from '../pages/customer/CustomerCart';
import CustomerCheckout from '../pages/customer/CustomerCheckout';
import CustomerOrderConfirmation from '../pages/customer/CustomerOrderConfirmation';
import CustomerOrders from '../pages/customer/CustomerOrders';
import CustomerOrderDetail from '../pages/customer/CustomerOrderDetail';
import TiffinPlansDiscovery from '../pages/customer/TiffinPlansDiscovery';
import TiffinPlanDetailCheckout from '../pages/customer/TiffinPlanDetailCheckout';
import CustomerSubscriptionsList from '../pages/customer/CustomerSubscriptionsList';
import CustomerSubscriptionDetail from '../pages/customer/CustomerSubscriptionDetail';
import CustomerSupport from '../pages/customer/CustomerSupport';
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
    <Route
      path="/user/order-confirmation/:id"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerOrderConfirmation />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/orders"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerOrders />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/orders/:id"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerOrderDetail />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/tiffin-plans"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <TiffinPlansDiscovery />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/tiffin-plans/:id"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <TiffinPlanDetailCheckout />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/subscriptions"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerSubscriptionsList />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/subscriptions/:id"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerSubscriptionDetail />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/user/support"
      element={
        <ProtectedRoute roleType="customer">
          <LocationProvider>
            <CartProvider>
              <CustomerSupport />
            </CartProvider>
          </LocationProvider>
        </ProtectedRoute>
      }
    />
    <Route path="/user" element={<Navigate to="/user/home" replace />} />
  </>
);

export default renderCustomerRoutes;
