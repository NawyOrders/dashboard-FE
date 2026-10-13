import { cn } from '@/presentation/lib/cn';
import { DURATIONS } from '@/domain/entities';
import type { DurationMonths } from '@/domain/entities';

export interface DurationSegmentedProps {
  value: DurationMonths;
  onChange: (value: DurationMonths) => void;
  disabled?: boolean;
}

export function DurationSegmented({ value, onChange, disabled }: DurationSegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Duration"
      className="inline-flex rounded-panel border border-border bg-card p-1"
    >
      {DURATIONS.map((months) => {
        const selected = months === value;
        return (
          <button
            key={months}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(months)}
            className={cn(
              'rounded-[8px] px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed',
              selected ? 'bg-primary text-white' : 'text-text-muted hover:text-text',
            )}
          >
            {months} months
          </button>
        );
      })}
    </div>
  );
}