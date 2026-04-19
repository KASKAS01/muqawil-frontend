import { clsx } from 'clsx';

/* DGA semantic token mapping — no arbitrary colors */
const colorMap: Record<string, string> = {
  OPEN:      'bg-green-50  text-green-600  border-green-600',
  HIRED:     'bg-primary-50 text-primary-600 border-primary-600',
  CLOSED:    'bg-ink-100   text-ink-700    border-ink-300',
  PENDING:   'bg-yellow-50 text-yellow-600 border-yellow-600',
  ACCEPTED:  'bg-green-50  text-green-600  border-green-600',
  REJECTED:  'bg-red-50    text-red-600    border-red-600',
  ACTIVE:    'bg-blue-50   text-blue-600   border-blue-600',
  COMPLETED: 'bg-green-50  text-green-600  border-green-600',
  DISPUTED:  'bg-yellow-50 text-yellow-600 border-yellow-600',
  SUBMITTED: 'bg-primary-50 text-primary-600 border-primary-600',
  APPROVED:  'bg-green-50  text-green-600  border-green-600',
  PAID:      'bg-green-50  text-green-600  border-green-600',
};

export default function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium',
        colorMap[status] ?? 'bg-ink-100 text-ink-700 border-ink-300',
      )}
    >
      {label ?? status}
    </span>
  );
}
