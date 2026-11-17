import type { ReactNode } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Custom action, for links; takes the place of `actionLabel`/`onAction`. */
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-avatar bg-bg-2 text-primary">
        {icon ?? <ClipboardList aria-hidden="true" className="size-7" />}
      </div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && (
        <p className="max-w-[62ch] text-pretty text-sm leading-relaxed text-text-muted">{description}</p>
      )}
      {action ? (
        <div className="mt-2">{action}</div>
      ) : (
        actionLabel &&
        onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}