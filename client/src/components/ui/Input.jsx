import { forwardRef } from 'react';
import cn from '@utils/cn';

const Input = forwardRef(function Input({ label, error, className = '', id, ...props }, ref) {
  const inputId = id || props.name;

  return (
    <div className="text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-secondary-900 outline-none transition-colors placeholder:text-secondary-400 focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-50',
          error ? 'border-red-500' : 'border-secondary-500/20',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
