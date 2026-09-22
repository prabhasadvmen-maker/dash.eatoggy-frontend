import React from 'react';

const FormField = ({
  label,
  error,
  helperText,
  required = false,
  children,
  className = '',
  id
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
};

export default FormField;
