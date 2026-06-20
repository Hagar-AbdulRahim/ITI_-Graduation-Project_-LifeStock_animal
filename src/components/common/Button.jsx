import React from 'react';
import Loader from './Loader';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  isLoading = false,
  disabled = false,
  icon,
}) => {
  const baseStyles = 'flex items-center justify-center gap-2 rounded-lg py-3 px-4 font-bold transition-colors duration-200 w-full focus:outline-none';
  
  const variants = {
    primary: 'bg-[#154b23] text-white hover:bg-[#0f3619] disabled:bg-[#154b23]/70',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? <Loader size="sm" color={variant === 'primary' ? 'white' : 'currentColor'} /> : null}
      {!isLoading && children}
      {!isLoading && icon && <span className="flex items-center justify-center">{icon}</span>}
    </button>
  );
};

export default Button;
