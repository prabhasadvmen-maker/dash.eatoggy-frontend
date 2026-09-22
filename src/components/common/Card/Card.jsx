import React from 'react';

const Card = ({
  title,
  subtitle,
  header,
  footer,
  children,
  padding = 'md',
  hover = false,
  className = '',
  id,
  action
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      id={id}
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm transition-all ${
        hover ? 'hover:border-slate-300 hover:shadow-md' : ''
      } ${className}`}
    >
      {(header || title) && (
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          {header ? (
            header
          ) : (
            <div>
              {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}

      <div className={paddings[padding] || paddings.md}>{children}</div>

      {footer && (
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
