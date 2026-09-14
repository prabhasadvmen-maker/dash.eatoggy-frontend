import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({
  type = 'error',
  title,
  message,
  children,
  onClose,
  className = '',
  id
}) => {
  const config = {
    error: {
      color: 'bg-rose-50 border-rose-200 text-rose-700',
      icon: AlertCircle
    },
    success: {
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: CheckCircle2
    },
    warning: {
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle
    },
    info: {
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: Info
    }
  };

  const current = config[type] || config.error;
  const IconComponent = current.icon;
  const contentText = message || children;

  if (!contentText && !title) return null;

  return (
    <div
      id={id}
      className={`p-4 rounded-xl border flex items-start gap-3 text-xs transition-all ${current.color} ${className}`}
    >
      <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="font-bold">{title}</h4>}
        {contentText && <div className="leading-relaxed font-medium">{contentText}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 hover:bg-slate-200/50 rounded-lg shrink-0 opacity-80 hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
