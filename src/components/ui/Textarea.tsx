import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={fieldId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          id={fieldId}
          ref={ref}
          className={clsx(
            'w-full rounded-lg border bg-white px-3 py-2 text-base text-ink-900 placeholder:text-ink-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
            'resize-none transition-colors',
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

Textarea.displayName = 'Textarea';
export default Textarea;
