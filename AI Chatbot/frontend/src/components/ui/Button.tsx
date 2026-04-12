import React, { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary",
    ghost: "bg-transparent hover:bg-surface text-muted border border-border-subtle focus:ring-primary",
    danger: "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 focus:ring-danger"
  };

  const isDisabled = disabled || isLoading;

  return (
    <button className={`${baseStyle} ${variants[variant]} ${isDisabled ? 'opacity-70' : ''} ${className}`} disabled={isDisabled} {...props}>
      {isLoading && <Spinner aria-hidden="true" />}
      {children}
    </button>
  );
};
