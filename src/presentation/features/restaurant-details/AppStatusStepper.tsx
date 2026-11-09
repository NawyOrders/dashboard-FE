import { Check } from 'lucide-react';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import type { AppStatus } from '@/domain/entities';

const STEPS: AppStatus[] = ['not_started', 'in_preparation', 'submitted_to_store', 'published'];

export function AppStatusStepper({ status }: { status: AppStatus | null }) {
  const value: AppStatus = status ?? 'not_started';
  const currentIndex = STEPS.indexOf(value);

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-2xs font-semibold',
                done
                  ? 'border-success-fg bg-success-bg text-success-fg'
                  : active
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-card text-text-muted',
              )}
            >
              {done ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                'whitespace-nowrap text-2xs font-medium',
                active ? 'text-text' : 'text-text-muted',
              )}
            >
              {en.status.app[step]}
            </span>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn('hidden h-px flex-1 sm:block', done ? 'bg-success-fg' : 'bg-border')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}