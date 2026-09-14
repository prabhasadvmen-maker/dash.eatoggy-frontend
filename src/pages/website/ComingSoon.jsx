import React from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const ComingSoon = ({ title, icon: Icon }) => {
  const location = useLocation();
  const defaultTitle = location.pathname.substring(1).replace(/-/g, ' ') || 'Dashboard';
  
  const DisplayIcon = Icon || HelpCircle;
  const displayTitle = title || defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-6">
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <DisplayIcon size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{displayTitle}</h2>
        <p className="text-gray-500">
          We are currently working hard on this feature. It will be available in the upcoming updates!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
