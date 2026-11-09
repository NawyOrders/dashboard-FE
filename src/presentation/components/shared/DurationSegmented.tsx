import { cn } from '@/presentation/lib/cn';
import { DURATIONS } from '@/domain/entities';
import type { DurationMonths } from '@/domain/entities';
import { en } from '@/presentation/i18n/en';

export interface DurationSegmentedProps {
  value: DurationMonths;
  onChange: (value: DurationMonths) => void;
  disabled?: boolean;
  /** Durations to offer; callers pass the durations sold by `GET /offers`. */
  options?: DurationMonths[];
}

export function DurationSegmented({
  value,
  onChange,
  disabled,
  options = DURATIONS,
}: DurationSegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label={en.registration.duration}
      className="inline-flex rounded-panel border border-border bg-card p-1"
    >
      {options.map((months) => {
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
            {en.common.months(months)}
          </button>
        );
      })}
    </div>
  );
}