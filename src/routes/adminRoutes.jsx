import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminDashboardLayout from '../layouts/admin/AdminDashboardLayout';
import AdminLogin from '../pages/auth/AdminLogin';
import AdminOverview from '../pages/admin/AdminOverview';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPartners from '../pages/admin/AdminPartners';
import AdminServices from '../pages/admin/AdminServices';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminLiveTracking from '../pages/admin/AdminLiveTracking';
import AdminFinance from '../pages/admin/AdminFinance';
import AdminMarketing from '../pages/admin/AdminMarketing';
import AdminSupport from '../pages/admin/AdminSupport';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import ComingSoon from '../pages/website/ComingSoon';
import {
  Users, Wrench, Briefcase, Calendar, MapPin,
  IndianRupee, Gift, MessageSquare, BarChart2, Bell, Settings, MessageSquareWarning
} from 'lucide-react';

export const renderAdminRoutes = () => (
  <>
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute roleType="admin">
          <AdminDashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminOverview />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="partners" element={<AdminPartners />} />
      <Route path="services" element={<AdminServices />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="tracking" element={<AdminLiveTracking />} />
      <Route path="finance" element={<AdminFinance />} />
      <Route path="marketing" element={<AdminMarketing />} />
      <Route path="support" element={<AdminSupport />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="notifications" element={<ComingSoon title="Notifications" icon={Bell} />} />
      <Route path="settings" element={<ComingSoon title="Settings" icon={Settings} />} />
      <Route path="profile" element={<ComingSoon title="Profile" icon={Users} />} />
      <Route path="help" element={<ComingSoon title="Help Center" icon={MessageSquareWarning} />} />
    </Route>
  </>
);

export default renderAdminRoutes;
