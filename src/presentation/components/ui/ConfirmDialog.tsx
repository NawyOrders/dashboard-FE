import type { ReactNode } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { en } from '@/presentation/i18n/en';

export interface Change {
  label: string;
  previous: string | null;
  next: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  changes?: Change[];
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog required before any sensitive change
 * (agent.md §4 rule 8). Always shows previous → new values when available.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  changes = [],
  confirmLabel = en.confirm.confirmAction,
  tone = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {en.common.cancel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {body && <p className="text-sm text-text">{body}</p>}
        {changes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {changes.map((change, index) => (
              <li
                key={index}
                className="flex flex-col gap-1 rounded-panel border border-border bg-bg-2/50 p-3"
              >
                <span className="text-2xs font-medium text-text-muted">{change.label}</span>
                <span className="text-sm text-text">
                  <span className="font-medium">{change.previous ?? '—'}</span>
                  <span aria-hidden="true" className="mx-2 text-text-muted">
                    →
                  </span>
                  <span className="font-medium">{change.next}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}