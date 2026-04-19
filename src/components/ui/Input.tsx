import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'h-10 w-full rounded-lg border bg-white px-3 text-base text-ink-900 placeholder:text-ink-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
            'transition-colors',
            error ? 'border-red-600 focus:ring-red-600' : 'border-ink-300',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-sm text-ink-500">{hint}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
