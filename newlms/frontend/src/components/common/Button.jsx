import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, outline, ghost, icon
  size = 'md', // sm, md, lg
  disabled = false,
  isLoading = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-[14px] transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-6 py-3.5 text-sm',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-600 to-secondary-purple text-white shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-slate-400',
    danger: 'bg-gradient-to-r from-error-rose to-red-500 text-white shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 border border-transparent focus:ring-red-500',
    outline: 'bg-transparent border border-brand-200 hover:bg-brand-50/50 text-brand-600 focus:ring-brand-500',
    ghost: 'bg-transparent hover:bg-slate-50/60 text-slate-600 focus:ring-slate-400',
    icon: 'p-2.5 rounded-[12px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 focus:ring-brand-500 shadow-sm'
  };

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      whileHover={!disabled && !isLoading ? { scale: 1.01 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className={`${children ? 'mr-2' : ''} h-4 w-4`} />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
