import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DeliveryLogin from '../pages/delivery/DeliveryLogin';
import DeliveryRegistration from '../pages/delivery/DeliveryRegistration';
import DeliveryOnboardingWizard from '../pages/delivery/DeliveryOnboardingWizard';
import DeliveryHome from '../pages/delivery/DeliveryHome';
import DeliveryEarnings from '../pages/delivery/DeliveryEarnings';
import DeliverySupport from '../pages/delivery/DeliverySupport';

export const renderDeliveryRoutes = () => (
  <>
    <Route path="/delivery/login" element={<DeliveryLogin />} />
    <Route path="/delivery/register" element={<DeliveryRegistration />} />

    <Route
      path="/delivery/onboarding"
      element={
        <ProtectedRoute roleType="delivery">
          <DeliveryOnboardingWizard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/delivery/home"
      element={
        <ProtectedRoute roleType="delivery">
          <DeliveryHome />
        </ProtectedRoute>
      }
    />

    <Route
      path="/delivery/earnings"
      element={
        <ProtectedRoute roleType="delivery">
          <DeliveryEarnings />
        </ProtectedRoute>
      }
    />

    <Route
      path="/delivery/support"
      element={
        <ProtectedRoute roleType="delivery">
          <DeliverySupport />
        </ProtectedRoute>
      }
    />
  </>
);

export default renderDeliveryRoutes;
