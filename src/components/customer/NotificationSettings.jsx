import React, { useState } from 'react';
import { useNotifications } from '../../hooks/customer/useNotifications.js';

const NotificationSettings = ({ preferences = {}, onSave, isLoading, fcmToken }) => {
  const [prefs, setPrefs] = useState({
    orderUpdates: preferences.orderUpdates ?? true,
    offers: preferences.offers ?? true,
    delivery: preferences.delivery ?? true,
  });

  const { registerToken, isRegistering } = useNotifications();
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleAll = (value) => {
    setPrefs({
      orderUpdates: value,
      offers: value,
      delivery: value,
    });
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        // Mock getting FCM token since we don't have firebase initialized here
        const mockToken = 'mock-fcm-token-' + Date.now();
        registerToken({ fcmToken: mockToken, deviceType: 'web' });
      } else {
        alert('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting permission', error);
    }
  };

  const isAllEnabled = prefs.orderUpdates && prefs.offers && prefs.delivery;

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Push Notifications</h3>
          <p className="text-sm text-gray-500">
            {permissionStatus === 'granted' 
              ? 'Notifications are enabled on this device.' 
              : 'Allow push notifications to get real-time updates.'}
          </p>
        </div>
        {permissionStatus !== 'granted' && (
          <button
            onClick={requestPermission}
            disabled={isRegistering}
            className="px-4 py-2 bg-orange-100 text-orange-700 font-medium text-sm rounded hover:bg-orange-200"
          >
            {isRegistering ? 'Enabling...' : 'Enable'}
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <label className="font-medium text-gray-900 cursor-pointer flex-1" onClick={() => handleToggleAll(!isAllEnabled)}>
            Enable All Notifications
          </label>
          <input 
            type="checkbox" 
            checked={isAllEnabled}
            onChange={(e) => handleToggleAll(e.target.checked)}
            className="h-5 w-5 text-orange-600 focus:ring-orange-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Order Updates</p>
            <p className="text-sm text-gray-500">Get notified when your order status changes.</p>
          </div>
          <input 
            type="checkbox" 
            checked={prefs.orderUpdates}
            onChange={() => handleToggle('orderUpdates')}
            className="h-5 w-5 text-orange-600 focus:ring-orange-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Offers & Promotions</p>
            <p className="text-sm text-gray-500">Receive exclusive discounts and coupons.</p>
          </div>
          <input 
            type="checkbox" 
            checked={prefs.offers}
            onChange={() => handleToggle('offers')}
            className="h-5 w-5 text-orange-600 focus:ring-orange-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Delivery Updates</p>
            <p className="text-sm text-gray-500">Track your rider in real-time.</p>
          </div>
          <input 
            type="checkbox" 
            checked={prefs.delivery}
            onChange={() => handleToggle('delivery')}
            className="h-5 w-5 text-orange-600 focus:ring-orange-500 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => onSave(prefs)}
          disabled={isLoading}
          className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
