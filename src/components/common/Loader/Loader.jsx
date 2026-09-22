import React from 'react';
import Spinner from './Spinner';
import { Bike } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'md', className = '' }) => {
  return (
    <div className={`p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} />
      {message && <p className="text-xs text-slate-600 font-medium">{message}</p>}
    </div>
  );
};

export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-amber-50 border border-[#d4af37]/30 rounded-2xl flex items-center justify-center text-[#d4af37] shadow-sm animate-pulse">
          <Bike className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-xs font-semibold text-slate-600">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
