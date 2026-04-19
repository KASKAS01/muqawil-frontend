import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'h-10 w-full appearance-none rounded-lg border bg-white px-3 text-base text-ink-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
            'transition-colors',
            error ? 'border-red-600' : 'border-ink-300',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
