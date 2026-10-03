import React from 'react';
import { Card } from '../common';
import { Bell } from 'lucide-react';

const NotificationsTab = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
        <button className="text-sm text-[#d4af37] font-medium hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-3">
        <Card className="p-4 border-l-4 border-l-[#d4af37] bg-amber-50/50">
          <div className="flex items-start">
            <div className="bg-[#d4af37] text-white p-2 rounded-full mr-4 mt-1">
              <Bell size={16} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">New Incentive Alert!</h4>
              <p className="text-sm text-slate-600 mt-1">Complete 10 deliveries today between 7PM and 11PM to earn an extra ₹200 bonus!</p>
              <p className="text-xs text-slate-400 mt-2">Just now</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-transparent hover:bg-slate-50 transition-colors">
          <div className="flex items-start">
            <div className="bg-slate-200 text-slate-600 p-2 rounded-full mr-4 mt-1">
              <Bell size={16} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Payout Processed</h4>
              <p className="text-sm text-slate-600 mt-1">Your withdrawal of ₹1,500 has been processed and credited to your bank account.</p>
              <p className="text-xs text-slate-400 mt-2">Yesterday</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-transparent hover:bg-slate-50 transition-colors">
          <div className="flex items-start">
            <div className="bg-slate-200 text-slate-600 p-2 rounded-full mr-4 mt-1">
              <Bell size={16} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Document Verification</h4>
              <p className="text-sm text-slate-600 mt-1">Your driving license and RC have been successfully verified.</p>
              <p className="text-xs text-slate-400 mt-2">Oct 1, 2026</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsTab;
