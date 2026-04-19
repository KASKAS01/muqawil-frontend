'use client';

import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        /* Base — spec: radius 8px, font-medium */
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          /* Primary — DGA primary-600/700/800 */
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-600':
            variant === 'primary',
          /* Secondary — outlined primary */
          'border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-600':
            variant === 'secondary',
          /* Tertiary — ghost */
          'text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-600':
            variant === 'tertiary',
          /* Danger — DGA red-600 */
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-700 focus:ring-red-600':
            variant === 'danger',
          /* Sizes — 8px grid, spec: label 16px */
          'h-8 px-3 text-sm':   size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="me-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
