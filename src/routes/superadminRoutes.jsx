import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/superadmin/DashboardLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/superadmin/Dashboard';
import Admins from '../pages/superadmin/Admins';
import Restaurants from '../pages/superadmin/Restaurants';
import DeliveryPartners from '../pages/superadmin/DeliveryPartners';
import Categories from '../pages/superadmin/Categories';
import Subcategories from '../pages/superadmin/Subcategories';
import MenuVerification from '../pages/superadmin/MenuVerification';
import ComingSoon from '../pages/website/ComingSoon';
import Banners from '../pages/superadmin/Banners';
import {
  UserSquare2, Bike, ShoppingBag, CreditCard, MenuSquare,
  Banknote, Undo2, Landmark, Tags, Star, MessageSquareWarning,
  BarChart3, Settings
} from 'lucide-react';

import SuperAdminCustomers from '../pages/superadmin/SuperAdminCustomers';
import SuperAdminOrders from '../pages/superadmin/SuperAdminOrders';
import SuperAdminSubscriptions from '../pages/superadmin/SuperAdminSubscriptions';
import SuperAdminPayments from '../pages/superadmin/SuperAdminPayments';
import SuperAdminRefunds from '../pages/superadmin/SuperAdminRefunds';
import SuperAdminSettlements from '../pages/superadmin/SuperAdminSettlements';
import SuperAdminReviews from '../pages/superadmin/SuperAdminReviews';
import SuperAdminSupport from '../pages/superadmin/SuperAdminSupport';
import SuperAdminReports from '../pages/superadmin/SuperAdminReports';
import SuperAdminSettings from '../pages/superadmin/SuperAdminSettings';

export const renderSuperAdminRoutes = () => (
  <>
    <Route path="/superadmin/login" element={<Login />} />
    <Route
      path="/superadmin"
      element={
        <ProtectedRoute roleType="superadmin">
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="admins-roles" element={<Admins />} />
      <Route path="customers" element={<SuperAdminCustomers />} />
      <Route path="restaurants" element={<Restaurants />} />
      <Route path="delivery-partners" element={<DeliveryPartners />} />
      <Route path="orders" element={<SuperAdminOrders />} />
      <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
      <Route path="menu-management">
        <Route path="categories" element={<Categories />} />
        <Route path="subcategories" element={<Subcategories />} />
        <Route path="verification" element={<MenuVerification />} />
      </Route>
      <Route path="payments" element={<SuperAdminPayments />} />
      <Route path="refunds" element={<SuperAdminRefunds />} />
      <Route path="settlements" element={<SuperAdminSettlements />} />
      <Route path="banners" element={<Banners />} />
      <Route path="coupons" element={<ComingSoon title="Coupons & Offers" icon={Tags} />} />
      <Route path="reviews" element={<SuperAdminReviews />} />
      <Route path="support" element={<SuperAdminSupport />} />
      <Route path="reports" element={<SuperAdminReports />} />
      <Route path="settings" element={<SuperAdminSettings />} />
    </Route>
  </>
);

export default renderSuperAdminRoutes;
