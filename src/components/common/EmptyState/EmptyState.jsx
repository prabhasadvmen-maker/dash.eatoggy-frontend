import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'There are no records found to display here.',
  action,
  className = ''
}) => {
  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mb-1">
        <Icon className="w-6 h-6" />
      </div>
      {title && <h3 className="text-sm font-bold text-slate-800">{title}</h3>}
      {description && <p className="text-xs text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
