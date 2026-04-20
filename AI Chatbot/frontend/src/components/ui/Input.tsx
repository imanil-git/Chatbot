import { InputHTMLAttributes, forwardRef } from 'react';
import { FormError } from './FormError';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-200 mb-1">{label}</label>}
        <input 
          ref={ref}
          className={`w-full px-4 py-2 bg-surface flex border border-border-subtle rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted ${error ? 'ring-1 ring-danger border-danger' : ''} ${className}`} 
          {...props} 
        />
        {error && <FormError message={error} />}
      </div>
    );
  }
);
Input.displayName = 'Input';
