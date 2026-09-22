import React from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import UserLogin from '../pages/auth/UserLogin';
import CustomerDashboardLayout from '../layouts/customer/CustomerDashboardLayout';
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
import ComingSoon from '../pages/website/ComingSoon';
import { Tags, Bell, MapPin, UserCircle, Settings, HelpCircle } from 'lucide-react';
import { LocationProvider } from '../context/LocationContext';
import { CartProvider } from '../context/CartContext';

export const renderCustomerRoutes = () => (
  <Route
    path="/user"
    element={
      <LocationProvider>
        <CartProvider>
          <Outlet />
        </CartProvider>
      </LocationProvider>
    }
  >
    <Route path="login" element={<UserLogin />} />

    <Route
      element={
        <ProtectedRoute roleType="customer">
          <CustomerDashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<CustomerDashboard />} />
      <Route path="home" element={<CustomerHome />} />
      <Route path="restaurant/:id" element={<CustomerRestaurantDetail />} />
      <Route path="cart" element={<CustomerCart />} />
      <Route path="checkout" element={<CustomerCheckout />} />
      <Route path="order-confirmation/:id" element={<CustomerOrderConfirmation />} />
      <Route path="orders" element={<CustomerOrders />} />
      <Route path="orders/:id" element={<CustomerOrderDetail />} />
      <Route path="tiffin-plans" element={<TiffinPlansDiscovery />} />
      <Route path="tiffin-plans/:id" element={<TiffinPlanDetailCheckout />} />
      <Route path="subscriptions" element={<CustomerSubscriptionsList />} />
      <Route path="subscriptions/:id" element={<CustomerSubscriptionDetail />} />
      <Route path="support" element={<CustomerSupport />} />
      <Route path="offers" element={<ComingSoon title="Offers & Coupons" icon={Tags} />} />
      <Route path="notifications" element={<ComingSoon title="Notifications" icon={Bell} />} />
      <Route path="addresses" element={<ComingSoon title="My Addresses" icon={MapPin} />} />
      <Route path="profile" element={<ComingSoon title="My Profile" icon={UserCircle} />} />
      <Route path="settings" element={<ComingSoon title="Settings" icon={Settings} />} />
      <Route path="help" element={<ComingSoon title="Help Center" icon={HelpCircle} />} />
    </Route>
  </Route>
);

export default renderCustomerRoutes;
