import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-dark-light">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-4 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-cream-dark focus:border-primary'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
