import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RestaurantDashboardLayout from '../layouts/restaurant/RestaurantDashboardLayout';
import RestaurantLogin from '../pages/auth/RestaurantLogin';
import RestaurantOnboardingWizard from '../pages/restaurant/RestaurantOnboardingWizard';
import RestaurantOverview from '../pages/restaurant/RestaurantOverview';
import MenuManagement from '../pages/restaurant/MenuManagement';
import ComingSoon from '../pages/website/ComingSoon';
import {
  ShoppingBag, UtensilsCrossed, CreditCard, MenuSquare, Bike,
  IndianRupee, Star, Users, MessageSquare, Store, Clock, Bell, ShieldCheck, Settings, UserSquare2, MessageSquareWarning
} from 'lucide-react';

export const renderRestaurantRoutes = () => (
  <>
    <Route path="/restaurant-login" element={<RestaurantLogin />} />
    <Route path="/restaurant-onboarding" element={
      <ProtectedRoute roleType="restaurant">
        <RestaurantOnboardingWizard />
      </ProtectedRoute>
    } />
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
      <Route path="menu" element={<MenuManagement />} />
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
  </>
);

export default renderRestaurantRoutes;
