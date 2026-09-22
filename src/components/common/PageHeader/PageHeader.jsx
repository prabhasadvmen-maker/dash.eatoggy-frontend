import React from 'react';

const PageHeader = ({
  title,
  description,
  icon: Icon,
  action,
  breadcrumbs,
  extra,
  className = ''
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm ${className}`}>
      <div className="space-y-1">
        {breadcrumbs && <div className="text-xs text-slate-400 mb-1">{breadcrumbs}</div>}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-11 h-11 bg-amber-50 border border-[#d4af37]/20 rounded-xl flex items-center justify-center text-[#a58523] shrink-0 shadow-sm">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            {title && <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
      </div>

      {(action || extra) && (
        <div className="flex items-center gap-3 shrink-0">
          {extra}
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
