import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { en } from '@/presentation/i18n/en';

export interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
}

/**
 * Error panel for data screens. It shows a translated message and a Retry action; the
 * raw exception text is never rendered.
 */
export function ErrorState({
  title = en.common.errorTitle,
  message = en.common.errorBody,
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-panel border border-danger-bg bg-danger-bg/40 px-6 py-10 text-center">
      <AlertTriangle aria-hidden="true" className="size-8 text-danger-fg" />
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {message && <p className="max-w-md text-sm text-text-muted">{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          {en.common.retry}
        </Button>
      )}
    </div>
  );
}
