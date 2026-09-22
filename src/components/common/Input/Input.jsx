import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  type = 'text',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  id,
  name,
  className = '',
  inputClassName = '',
  rows,
  ...props
}, ref) => {
  const isTextArea = type === 'textarea' || Boolean(rows);

  const inputStyles = `
    w-full bg-white border text-slate-900 placeholder-slate-400 text-xs font-medium transition-all shadow-sm
    focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
    ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-[#d4af37] focus:ring-[#d4af37]'}
    ${LeftIcon ? 'pl-11' : 'pl-4'}
    ${RightIcon ? 'pr-11' : 'pr-4'}
    ${isTextArea ? 'py-3 rounded-xl' : 'py-3 rounded-xl'}
    ${inputClassName}
  `;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <LeftIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}

        {isTextArea ? (
          <textarea
            ref={ref}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows || 3}
            className={inputStyles}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputStyles}
            {...props}
          />
        )}

        {RightIcon && (
          <RightIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        )}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
