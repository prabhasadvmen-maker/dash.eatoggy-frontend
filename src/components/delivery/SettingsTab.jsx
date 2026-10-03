import React from 'react';
import { Card, Button } from '../common';
import { Bell, Shield, HelpCircle, ChevronRight, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Settings</h2>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center text-slate-700">
              <Globe size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Language Preference</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-slate-400 mr-2">English</span>
              <ChevronRight size={20} className="text-slate-400" />
            </div>
          </button>
          
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center text-slate-700">
              <Bell size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Notification Preferences</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
          
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center text-slate-700">
              <Lock size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Change Password</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>

          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center text-slate-700">
              <Shield size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Account Security</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden mt-6">
        <div className="divide-y divide-slate-100">
          <button 
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            onClick={() => navigate('/delivery/support')}
          >
            <div className="flex items-center text-slate-700">
              <HelpCircle size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Help & Support</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </Card>

      <div className="text-center text-xs text-slate-400 mt-8">
        Eatoggy Partner App v1.0.0
      </div>
    </div>
  );
};

export default SettingsTab;
