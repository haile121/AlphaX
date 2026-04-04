import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-btn border bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'transition-colors duration-150',
            error
              ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-accent dark:focus:border-accent-dark',
            'focus:outline-none focus:ring-2 focus:ring-accent/30 dark:focus:ring-accent-dark/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
