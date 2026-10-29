import { AlertTriangle, RotateCcw } from 'lucide-react';
import type { MenuExtractionProgress } from '@/application/dto';
import type { MenuFileProblem } from '@/domain/rules/menu-file';
import { Button } from '@/presentation/components/ui/Button';
import { en } from '@/presentation/i18n/en';

export type MenuPhase =
  | 'idle'
  | 'invalid'
  | 'submitting'
  | 'processing'
  | 'failed'
  | 'timeout'
  | 'empty'
  | 'completed';

export interface MenuOcrStatusProps {
  phase: MenuPhase;
  problem: MenuFileProblem;
  progress: MenuExtractionProgress;
  shownCount: number;
  totalCount: number;
  disabled?: boolean;
  onRetry: () => void;
  onViewResult: () => void;
}

function fileProblemMessage(problem: MenuFileProblem): string {
  if (problem === 'type') return en.menu.invalidType;
  if (problem === 'size') return en.menu.tooLarge;
  return en.menu.fileRequired;
}

function FailureRow({
  message,
  onRetry,
  disabled,
}: {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-panel border border-danger bg-danger-bg px-3 py-2">
      <span className="flex items-center gap-2 text-2xs font-medium text-danger-fg">
        <AlertTriangle aria-hidden="true" className="size-4" />
        {message}
      </span>
      <Button variant="secondary" size="sm" onClick={onRetry} disabled={disabled}>
        <RotateCcw aria-hidden="true" className="size-4" />
        {en.menu.retry}
      </Button>
    </div>
  );
}

/**
 * Renders the menu job states under the upload controls: validation error, submitting,
 * progress with the stage, failure with retry, timeout, empty and completed.
 */
export function MenuOcrStatus({
  phase,
  problem,
  progress,
  shownCount,
  totalCount,
  disabled,
  onRetry,
  onViewResult,
}: MenuOcrStatusProps) {
  const percentage = Math.round(
    Math.min(100, Math.max(0, progress.progressPercentage ?? 0)),
  );

  if (phase === 'invalid') {
    return (
      <p role="alert" className="text-2xs text-error">
        {fileProblemMessage(problem)}
      </p>
    );
  }

  if (phase === 'submitting') {
    return <p className="text-2xs text-text-muted">{en.menu.submitting}</p>;
  }

  if (phase === 'processing') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-2xs text-text-muted">
          <span>{en.menu.processing}</span>
          <span>{progress.stage ? `${progress.stage} · ${percentage}%` : `${percentage}%`}</span>
        </div>
        <div
          role="progressbar"
          aria-label={en.menu.processing}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          className="h-1.5 w-full overflow-hidden rounded-pill bg-bg-2"
        >
          <div
            className="h-full rounded-pill bg-primary transition-[width] duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  if (phase === 'failed') {
    return <FailureRow message={en.menu.failed} onRetry={onRetry} disabled={disabled} />;
  }

  if (phase === 'timeout') {
    return <FailureRow message={en.menu.timeout} onRetry={onRetry} disabled={disabled} />;
  }

  if (phase === 'empty') {
    return <p className="text-2xs text-text-muted">{en.menu.empty}</p>;
  }

  if (phase === 'completed') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-2xs text-text-muted">{en.menu.count(shownCount, totalCount)}</p>
        <Button variant="secondary" size="sm" onClick={onViewResult}>
          {en.menu.viewResult}
        </Button>
      </div>
    );
  }

  return null;
}
