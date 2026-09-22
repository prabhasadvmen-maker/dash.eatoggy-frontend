import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../Button/Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Unable to load content. Please try again.',
  onRetry,
  retryText = 'Try Again',
  className = ''
}) => {
  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
