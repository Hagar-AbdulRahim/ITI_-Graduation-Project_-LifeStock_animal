import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  iconLeft,
  iconRight,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {iconRight && (
          <div className="absolute right-3 flex items-center justify-center text-gray-500">
            {iconRight}
          </div>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          className={`w-full rounded-lg border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#154b23] focus:ring-[#154b23]'} bg-[#fcfcfc] px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:ring-1 ${iconRight ? 'pr-10' : ''} ${iconLeft ? 'pl-10' : ''} ${inputClassName}`}
          {...props}
        />
        {iconLeft && (
          <div className="absolute left-3 flex items-center justify-center text-gray-500">
            {iconLeft}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
