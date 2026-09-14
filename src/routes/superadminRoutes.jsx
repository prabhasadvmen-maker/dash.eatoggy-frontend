import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/superadmin/DashboardLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/superadmin/Dashboard';
import Admins from '../pages/superadmin/Admins';
import Restaurants from '../pages/superadmin/Restaurants';
import ComingSoon from '../pages/website/ComingSoon';
import {
  UserSquare2, Bike, ShoppingBag, CreditCard, MenuSquare,
  Banknote, Undo2, Landmark, Tags, Star, MessageSquareWarning,
  BarChart3, Settings
} from 'lucide-react';

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
      <Route path="customers" element={<ComingSoon title="Customers" icon={UserSquare2} />} />
      <Route path="restaurants" element={<Restaurants />} />
      <Route path="delivery-partners" element={<ComingSoon title="Delivery Partners" icon={Bike} />} />
      <Route path="orders" element={<ComingSoon title="Orders" icon={ShoppingBag} />} />
      <Route path="subscriptions" element={<ComingSoon title="Subscriptions" icon={CreditCard} />} />
      <Route path="menu-management" element={<ComingSoon title="Menu Management" icon={MenuSquare} />} />
      <Route path="payments" element={<ComingSoon title="Payments" icon={Banknote} />} />
      <Route path="refunds" element={<ComingSoon title="Refunds" icon={Undo2} />} />
      <Route path="settlements" element={<ComingSoon title="Settlements" icon={Landmark} />} />
      <Route path="coupons" element={<ComingSoon title="Coupons & Offers" icon={Tags} />} />
      <Route path="reviews" element={<ComingSoon title="Reviews & Ratings" icon={Star} />} />
      <Route path="support" element={<ComingSoon title="Support & Complaints" icon={MessageSquareWarning} />} />
      <Route path="reports" element={<ComingSoon title="Reports & Analytics" icon={BarChart3} />} />
      <Route path="settings" element={<ComingSoon title="Settings" icon={Settings} />} />
    </Route>
  </>
);

export default renderSuperAdminRoutes;
