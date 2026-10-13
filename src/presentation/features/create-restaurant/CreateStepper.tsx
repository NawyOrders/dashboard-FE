import { Check } from 'lucide-react';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import type { StepKey } from './schema';

const LABELS: Record<StepKey, string> = {
  basics: en.create.steps.basics,
  subscription: en.create.steps.subscription,
  branches: en.create.steps.branches,
  review: en.create.steps.review,
};

export function CreateStepper({ steps, current }: { steps: StepKey[]; current: number }) {
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-3">
      {steps.map((step, index) => {
        const complete = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-2xs font-semibold',
                complete && 'bg-primary text-white',
                active && 'border-2 border-primary text-primary',
                !complete && !active && 'border border-border text-text-muted',
              )}
            >
              {complete ? <Check aria-hidden="true" className="size-4" /> : index + 1}
            </span>
            <span className={cn('text-sm font-medium', active ? 'text-text' : 'text-text-muted')}>
              {LABELS[step]}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="hidden h-px w-8 bg-border sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}