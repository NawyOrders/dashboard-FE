import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ImageOff,
  RotateCcw,
  ScanText,
} from 'lucide-react';
import type { MenuExtractionProgress } from '@/application/dto';
import type { MenuFileProblem } from '@/domain/rules/menu-file';
import { Button } from '@/presentation/components/ui/Button';
import { cn } from '@/presentation/lib/cn';
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

const RING_RADIUS = 20;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function fileProblemMessage(problem: MenuFileProblem): string {
  if (problem === 'type') return en.menu.invalidType;
  if (problem === 'size') return en.menu.tooLarge;
  return en.menu.fileRequired;
}

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function ProgressRing({ percentage }: { percentage: number | null }) {
  const indeterminate = percentage === null;
  return (
    <div
      role={indeterminate ? undefined : 'progressbar'}
      aria-label={indeterminate ? undefined : en.menu.processing}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : percentage}
      className={cn(
        'relative flex size-14 shrink-0 items-center justify-center rounded-avatar bg-card',
        indeterminate && 'motion-safe:animate-spin motion-reduce:animate-none',
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="size-14 -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-border"
        />
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={
            indeterminate ? `${RING_LENGTH * 0.28} ${RING_LENGTH}` : RING_LENGTH
          }
          strokeDashoffset={
            indeterminate
              ? 0
              : RING_LENGTH - (RING_LENGTH * (percentage ?? 0)) / 100
          }
          className={cn(
            'text-primary',
            !indeterminate &&
              'transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none',
          )}
        />
      </svg>
      {!indeterminate && (
        <span className="absolute inset-0 flex items-center justify-center text-2xs font-semibold text-primary">
          {percentage}%
        </span>
      )}
    </div>
  );
}

function StateIcon({ tone, children }: { tone: 'primary' | 'success' | 'danger' | 'muted'; children: ReactNode }) {
  const tones = {
    primary: 'text-primary',
    success: 'text-success-fg',
    danger: 'text-danger-fg',
    muted: 'text-text-muted',
  } as const;

  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-avatar bg-card',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function ProcessingPanel({
  percentage,
  submitting,
  stage,
  elapsed,
}: {
  percentage: number | null;
  submitting: boolean;
  stage: string | null;
  elapsed: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-panel border border-border bg-bg-2/50 p-4">
      <ProgressRing percentage={percentage} />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1.5 text-2xs font-semibold text-primary">
          <ScanText aria-hidden="true" className="size-4 shrink-0" />
          {submitting ? en.menu.submitting : en.menu.processing}
        </span>
        {!submitting && stage ? (
          <p className="truncate text-2xs text-text-muted">{stage}</p>
        ) : null}
        <p className="flex items-center gap-1.5 text-2xs text-text-muted">
          <Clock3 aria-hidden="true" className="size-3.5 shrink-0" />
          <span>{en.menu.elapsed}</span>
          <span dir="ltr" className="font-mono tabular-nums text-text">
            {formatElapsed(elapsed)}
          </span>
        </p>
      </div>
    </div>
  );
}

function FailurePanel({
  message,
  actionLabel,
  onAction,
  disabled,
  hint,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-panel border border-danger-fg/25 bg-danger-bg p-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-start gap-2.5">
        <StateIcon tone="danger">
          <AlertTriangle aria-hidden="true" className="size-4" />
        </StateIcon>
        <div className="flex flex-col gap-0.5">
          <p className="text-2xs font-semibold text-danger-fg">{message}</p>
          {hint ? <p className="text-2xs text-text-muted">{hint}</p> : null}
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onAction}
        disabled={disabled}
        className="w-full md:w-auto"
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        {actionLabel}
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
  const running = phase === 'submitting' || phase === 'processing';
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now();
    setElapsed(0);
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const percentage =
    progress.progressPercentage === null
      ? null
      : Math.round(Math.min(100, Math.max(0, progress.progressPercentage)));

  if (phase === 'invalid') {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-panel border border-danger-fg/25 bg-danger-bg p-3"
      >
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger-fg" />
        <p className="text-2xs font-medium text-danger-fg">{fileProblemMessage(problem)}</p>
      </div>
    );
  }

  if (phase === 'submitting') {
    return <ProcessingPanel percentage={null} submitting stage={null} elapsed={elapsed} />;
  }

  if (phase === 'processing') {
    return (
      <ProcessingPanel
        percentage={percentage}
        submitting={false}
        stage={progress.stage}
        elapsed={elapsed}
      />
    );
  }

  if (phase === 'failed') {
    return (
      <FailurePanel
        message={en.menu.failed}
        actionLabel={en.menu.tryAgain}
        onAction={onRetry}
        disabled={disabled}
      />
    );
  }

  if (phase === 'timeout') {
    return (
      <FailurePanel
        message={en.menu.timeout}
        actionLabel={en.menu.retry}
        onAction={onRetry}
        disabled={disabled}
      />
    );
  }

  if (phase === 'empty') {
    return (
      <div
        role="status"
        className="flex items-start gap-2.5 rounded-panel border border-border bg-bg-2/50 p-4"
      >
        <StateIcon tone="muted">
          <ImageOff aria-hidden="true" className="size-4" />
        </StateIcon>
        <div className="flex flex-col gap-0.5">
          <p className="text-2xs font-semibold text-text">{en.menu.empty}</p>
          <p className="text-2xs text-text-muted">{en.menu.emptyHint}</p>
        </div>
      </div>
    );
  }

  if (phase === 'completed') {
    return (
      <div
        role="status"
        className="flex flex-col gap-3 rounded-panel border border-success-fg/25 bg-success-bg p-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-2.5">
          <StateIcon tone="success">
            <CheckCircle2 aria-hidden="true" className="size-4" />
          </StateIcon>
          <p className="text-2xs font-semibold text-success-fg">
            {en.menu.count(shownCount, totalCount)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewResult}
          className="w-full md:w-auto"
        >
          {en.menu.viewResult}
        </Button>
      </div>
    );
  }

  return null;
}
