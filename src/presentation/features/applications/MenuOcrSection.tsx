import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AlertTriangle, FileImage, RotateCcw, ScanText } from 'lucide-react';
import { api } from '@/app/composition';
import type { MenuExtractionProgress } from '@/application/dto';
import type { MenuFileProblem } from '@/domain/rules/menu-file';
import { checkMenuFile } from '@/domain/rules/menu-file';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { ErrorBoundary } from '@/presentation/components/ui/ErrorBoundary';
import { cn } from '@/presentation/lib/cn';
import { en } from '@/presentation/i18n/en';
import { MenuOcrStatus } from './MenuOcrStatus';
import type { MenuPhase } from './MenuOcrStatus';
import { MenuResultDialog } from './MenuResultDialog';
import type { MenuEditableField, MenuEditableItem } from './MenuResultDialog';

// OPEN: menu result is not sent with submit until backend accepts it.

const IDLE_PROGRESS: MenuExtractionProgress = {
  status: '',
  progressPercentage: null,
  stage: null,
};

export interface MenuOcrSectionProps {
  disabled?: boolean;
  /** Onboarding request the photo belongs to; sent as `referenceId` to the OCR endpoint. */
  referenceId?: string;
}

/**
 * Menu photo extraction inside the application preview. The section calls the
 * `extractMenu` use case only and renders the job states; the result lives in this
 * component and disappears when the dialog closes.
 */
export function MenuOcrSection({ disabled, referenceId }: MenuOcrSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<MenuPhase>('idle');
  const [problem, setProblem] = useState<MenuFileProblem>('required');
  const [progress, setProgress] = useState<MenuExtractionProgress>(IDLE_PROGRESS);
  const [items, setItems] = useState<MenuEditableItem[]>([]);
  const [resultOpen, setResultOpen] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const running = phase === 'submitting' || phase === 'processing';

  useEffect(() => () => controllerRef.current?.abort(), []);

  function clearResult() {
    setItems([]);
    setResultOpen(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    event.target.value = '';
    controllerRef.current?.abort();
    controllerRef.current = null;
    setFile(next);
    clearResult();
    setProgress(IDLE_PROGRESS);

    const nextProblem = checkMenuFile(next);
    if (nextProblem) {
      setProblem(nextProblem);
      setPhase('invalid');
      return;
    }
    setPhase('idle');
  }

  async function run(selected: File | null) {
    const knownProblem = checkMenuFile(selected);
    if (knownProblem || !selected) {
      setProblem(knownProblem ?? 'required');
      setPhase('invalid');
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    clearResult();
    setPhase('submitting');
    setProgress({ status: 'Queued', progressPercentage: 0, stage: null });

    try {
      const outcome = await api.extractMenu(selected, {
        referenceId,
        signal: controller.signal,
        onProgress: (next) => {
          if (controller.signal.aborted) return;
          setProgress(next);
          setPhase('processing');
        },
      });
      if (controller.signal.aborted) return;

      switch (outcome.status) {
        case 'invalid-file':
          setProblem(outcome.problem);
          setPhase('invalid');
          break;
        case 'failed':
          setPhase('failed');
          break;
        case 'timeout':
          setPhase('timeout');
          break;
        case 'completed': {
          const rows = outcome.items.map((item, index) => ({
            ...item,
            id: `menu-item-${index}`,
          }));
          setItems(rows);
          setPhase(rows.length === 0 ? 'empty' : 'completed');
          setResultOpen(rows.length > 0);
          break;
        }
      }
    } catch {
      if (!controller.signal.aborted) setPhase('failed');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  function handleEdit(id: string, field: MenuEditableField, value: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function handleRemove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section
      className="flex flex-col gap-4 rounded-card border border-border bg-card p-4"
      aria-label={en.menu.title}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
          <ScanText aria-hidden="true" className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-text">{en.menu.title}</h3>
          <p className="text-2xs text-text-muted">{en.menu.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
        <label
          htmlFor="rf-menu-file"
          className={cn(
            'flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-panel border border-dashed border-border bg-bg-2/40 px-3 text-2xs font-medium text-text',
            'transition-colors duration-150 hover:border-border-hover hover:bg-bg-2',
            (disabled || running) && 'pointer-events-none opacity-60',
          )}
        >
          <FileImage aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 truncate" title={file?.name ?? en.menu.chooseFile}>
            {file?.name ?? en.menu.chooseFile}
          </span>
        </label>
        <input
          id="rf-menu-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled || running}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          size="md"
          className="w-full md:ms-auto md:w-auto"
          loading={running}
          disabled={disabled || running}
          onClick={() => void run(file)}
        >
          {phase === 'submitting'
            ? en.menu.submitting
            : phase === 'processing'
              ? en.menu.processing
              : en.menu.extract}
        </Button>
      </div>

      <MenuOcrStatus
        phase={phase}
        problem={problem}
        progress={progress}
        shownCount={items.length}
        totalCount={items.length}
        disabled={disabled}
        onRetry={() => void run(file)}
        onViewResult={() => setResultOpen(true)}
      />

      <ErrorBoundary
        resetKey={resultOpen}
        fallback={(reset) => (
          <Dialog
            open
            onClose={() => {
              reset();
              setResultOpen(false);
            }}
            size="xl"
            mobileFull
            title={en.menu.title}
            footer={
              <Button
                variant="secondary"
                onClick={() => {
                  reset();
                  setResultOpen(false);
                }}
              >
                {en.common.close}
              </Button>
            }
          >
            <div role="alert" className="flex flex-col items-center gap-4 px-6 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-avatar bg-danger-bg text-danger-fg">
                <AlertTriangle aria-hidden="true" className="size-6" />
              </span>
              <p className="max-w-sm text-sm font-medium text-text">{en.menu.resultError}</p>
              <Button
                onClick={() => {
                  setResultOpen(true);
                  reset();
                }}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {en.common.retry}
              </Button>
            </div>
          </Dialog>
        )}
      >
        <MenuResultDialog
          open={resultOpen}
          rows={items}
          onClose={() => setResultOpen(false)}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </ErrorBoundary>
    </section>
  );
}
