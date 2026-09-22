import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminDashboardLayout from '../layouts/admin/AdminDashboardLayout';
import AdminLogin from '../pages/auth/AdminLogin';
import AdminOverview from '../pages/admin/AdminOverview';
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
      <Route path="users" element={<ComingSoon title="Users" icon={Users} />} />
      <Route path="partners" element={<ComingSoon title="Partners" icon={Wrench} />} />
      <Route path="services" element={<ComingSoon title="Services" icon={Briefcase} />} />
      <Route path="bookings" element={<ComingSoon title="Bookings" icon={Calendar} />} />
      <Route path="tracking" element={<ComingSoon title="Live Tracking" icon={MapPin} />} />
      <Route path="finance" element={<ComingSoon title="Finance" icon={IndianRupee} />} />
      <Route path="marketing" element={<ComingSoon title="Marketing" icon={Gift} />} />
      <Route path="support" element={<ComingSoon title="Support" icon={MessageSquare} />} />
      <Route path="analytics" element={<ComingSoon title="Analytics" icon={BarChart2} />} />
      <Route path="notifications" element={<ComingSoon title="Notifications" icon={Bell} />} />
      <Route path="settings" element={<ComingSoon title="Settings" icon={Settings} />} />
      <Route path="profile" element={<ComingSoon title="Profile" icon={Users} />} />
      <Route path="help" element={<ComingSoon title="Help Center" icon={MessageSquareWarning} />} />
    </Route>
  </>
);

export default renderAdminRoutes;
