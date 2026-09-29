import React, { useState } from 'react';
import NotificationSettings from '../../components/customer/NotificationSettings.jsx';
import { useNotifications } from '../../hooks/customer/useNotifications.js';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { history, isLoadingHistory } = useNotifications();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // settings or history

  const handleSavePreferences = async (prefs) => {
    setIsSaving(true);
    try {
      // API call to save preferences
      await new Promise(res => setTimeout(res, 500)); // mock
      toast.success('Preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'settings' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'history' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'settings' ? (
        <NotificationSettings 
          onSave={handleSavePreferences} 
          isLoading={isSaving} 
        />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          {isLoadingHistory ? (
            <div className="text-gray-500 text-center py-8">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((notif, idx) => (
                <div key={idx} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900">{notif.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
