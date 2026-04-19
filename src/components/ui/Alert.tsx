import { clsx } from 'clsx';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

/* DGA semantic tokens only */
const styles: Record<AlertVariant, string> = {
  error:   'bg-red-50    border-red-600    text-red-600',
  success: 'bg-green-50  border-green-600  text-green-600',
  warning: 'bg-yellow-50 border-yellow-600 text-yellow-600',
  info:    'bg-blue-50   border-blue-600   text-blue-600',
};

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  className?: string;
}

export default function Alert({ variant = 'error', message, className }: AlertProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={clsx(
        'rounded-lg border px-4 py-3 text-base font-medium',
        styles[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}
