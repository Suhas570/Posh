import React from 'react';

const Select = ({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  placeholder = 'Select an option',
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 select-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full text-xs font-semibold py-2.5 pl-3.5 pr-10 rounded-[14px] border bg-white appearance-none focus:outline-none focus:ring-4 transition-all cursor-pointer shadow-sm/5
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/5'
            }`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt, i) => {
            const optVal = typeof opt === 'string' ? opt : opt.value;
            const optLbl = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={i} value={optVal}>
                {optLbl}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default Select;
