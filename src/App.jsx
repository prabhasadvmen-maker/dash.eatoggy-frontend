import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ComingSoon from './pages/ComingSoon';
import Dashboard from './pages/Dashboard';
import AdminOverview from './pages/AdminOverview';
import Admins from './pages/Admins';
import RestaurantLogin from './pages/RestaurantLogin';
import RestaurantSignup from './pages/RestaurantSignup';
import RestaurantDashboardLayout from './components/RestaurantDashboardLayout';
import Restaurants from './pages/Restaurants';
import RestaurantOverview from './pages/RestaurantOverview';
import UserLogin from './pages/UserLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import {
  LayoutDashboard, UserSquare2, UtensilsCrossed, Bike,
  ShoppingBag, CreditCard, MenuSquare, Banknote, Undo2,
  Landmark, Tags, Star, MessageSquareWarning, BarChart3,
  Home, Users, Wrench, Briefcase, Calendar, MapPin, 
  IndianRupee, Gift, MessageSquare, BarChart2, Bell, Settings,
  Store, Clock, ShieldCheck
} from 'lucide-react';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to superadmin login */}
        <Route path="/" element={<Navigate to="/superadmin/login" replace />} />

        {/* --- SUPER ADMIN ROUTES --- */}
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

        {/* --- REGULAR ADMIN ROUTES --- */}
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

        {/* --- RESTAURANT ROUTES --- */}
        <Route path="/restaurant-login" element={<RestaurantLogin />} />
        <Route path="/restaurant-signup" element={<RestaurantSignup />} />

        <Route
          path="/restaurant"
          element={
            <ProtectedRoute roleType="restaurant">
              <RestaurantDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RestaurantOverview />} />
          <Route path="orders" element={<ComingSoon title="Orders" icon={ShoppingBag} />} />
          <Route path="kitchen" element={<ComingSoon title="Kitchen / Production" icon={UtensilsCrossed} />} />
          <Route path="subscriptions" element={<ComingSoon title="Subscriptions" icon={CreditCard} />} />
          <Route path="menu" element={<ComingSoon title="Menu Management" icon={MenuSquare} />} />
          <Route path="delivery" element={<ComingSoon title="Delivery & Pickup" icon={Bike} />} />
          <Route path="earnings" element={<ComingSoon title="Earnings / Payouts" icon={IndianRupee} />} />
          <Route path="reviews" element={<ComingSoon title="Reviews & Ratings" icon={Star} />} />
          <Route path="staff" element={<ComingSoon title="Staff Management" icon={Users} />} />
          <Route path="support" element={<ComingSoon title="Support" icon={MessageSquare} />} />
          
          {/* Settings */}
          <Route path="profile-details" element={<ComingSoon title="Restaurant Profile" icon={Store} />} />
          <Route path="hours" element={<ComingSoon title="Operating Hours" icon={Clock} />} />
          <Route path="notifications" element={<ComingSoon title="Notifications" icon={Bell} />} />
          <Route path="security" element={<ComingSoon title="Security" icon={ShieldCheck} />} />
          
          {/* Bottom */}
          <Route path="settings" element={<ComingSoon title="Settings" icon={Settings} />} />
          <Route path="profile" element={<ComingSoon title="User Profile" icon={UserSquare2} />} />
          <Route path="help" element={<ComingSoon title="Help Center" icon={MessageSquareWarning} />} />
        </Route>

        {/* --- CUSTOMER / USER ROUTES --- */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/dashboard" element={<CustomerDashboard />} />
        <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/superadmin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
