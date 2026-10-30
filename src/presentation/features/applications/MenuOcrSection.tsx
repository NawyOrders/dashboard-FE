import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FileImage } from 'lucide-react';
import { api } from '@/app/composition';
import type { MenuExtractionProgress } from '@/application/dto';
import type { MenuFileProblem } from '@/domain/rules/menu-file';
import { checkMenuFile } from '@/domain/rules/menu-file';
import { Button } from '@/presentation/components/ui/Button';
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
  const [timedOutJobId, setTimedOutJobId] = useState<string | null>(null);
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
    setTimedOutJobId(null);
    setProgress(IDLE_PROGRESS);

    const nextProblem = checkMenuFile(next);
    if (nextProblem) {
      setProblem(nextProblem);
      setPhase('invalid');
      return;
    }
    setPhase('idle');
  }

  async function run(selected: File | null, resumeJobId?: string) {
    const knownProblem = resumeJobId ? null : checkMenuFile(selected);
    if (!resumeJobId && (knownProblem || !selected)) {
      setProblem(knownProblem ?? 'required');
      setPhase('invalid');
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    clearResult();
    setTimedOutJobId(null);
    setPhase(resumeJobId ? 'processing' : 'submitting');
    if (!resumeJobId) setProgress({ status: 'Queued', progressPercentage: 0, stage: null });

    try {
      const outcome = await api.extractMenu(selected, {
        referenceId,
        jobId: resumeJobId,
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
          setTimedOutJobId(outcome.jobId);
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
      className="flex flex-col gap-3 rounded-card border border-border bg-card p-4"
      aria-label={en.menu.title}
    >
      <h3 className="text-sm font-semibold text-text">{en.menu.title}</h3>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="rf-menu-file"
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-panel border border-border px-3 text-2xs font-medium text-text',
            'transition-colors duration-150 hover:bg-bg-2',
            (disabled || running) && 'pointer-events-none opacity-60',
          )}
        >
          <FileImage aria-hidden="true" className="size-4" />
          {en.menu.chooseFile}
        </label>
        <input
          id="rf-menu-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled || running}
          onChange={handleFileChange}
        />
        <span className="max-w-[16rem] truncate text-2xs text-text-muted">{file?.name ?? ''}</span>
        <Button
          size="sm"
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
        onCheckAgain={() => void run(file, timedOutJobId ?? undefined)}
        onViewResult={() => setResultOpen(true)}
      />

      <MenuResultDialog
        open={resultOpen}
        rows={items}
        onClose={() => setResultOpen(false)}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
    </section>
  );
}
