import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import renderPublicRoutes from './routes/publicRoutes';
import renderSuperAdminRoutes from './routes/superadminRoutes';
import renderAdminRoutes from './routes/adminRoutes';
import renderRestaurantRoutes from './routes/restaurantRoutes';
import renderCustomerRoutes from './routes/customerRoutes';
import renderDeliveryRoutes from './routes/deliveryRoutes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to superadmin login */}
        <Route path="/" element={<Navigate to="/superadmin/login" replace />} />

        {renderPublicRoutes()}
        {renderSuperAdminRoutes()}
        {renderAdminRoutes()}
        {renderRestaurantRoutes()}
        {renderCustomerRoutes()}
        {renderDeliveryRoutes()}

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/superadmin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
