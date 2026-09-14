import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  id,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none font-medium';

  const variants = {
    primary: 'bg-[#d4af37] hover:bg-[#c29f2e] text-white font-bold shadow-sm active:scale-[0.99]',
    navy: 'bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-sm active:scale-[0.99]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold active:scale-[0.99]',
    outline: 'bg-white border border-[#d4af37]/40 text-[#a58523] hover:bg-amber-50 font-semibold active:scale-[0.99]',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold active:scale-[0.99]',
    dangerSolid: 'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm active:scale-[0.99]',
    success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold active:scale-[0.99]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-xs font-bold rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm font-bold rounded-xl gap-2.5'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      id={id}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{typeof children === 'string' ? children : 'Loading...'}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
