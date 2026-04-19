'use client';

import { useEffect, useRef } from 'react';
import Button from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function Modal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  return (
    /* spec: radius 12px, padding 24px */
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      className="w-full max-w-md rounded-xl border border-ink-300 bg-white p-6 backdrop:bg-ink-900/40"
    >
      <h2 className="mb-2 text-lg font-semibold text-ink-900">{title}</h2>
      {description && (
        <p className="mb-6 text-base text-ink-700">{description}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
