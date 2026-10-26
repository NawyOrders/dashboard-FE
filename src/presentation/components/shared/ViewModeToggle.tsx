import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '@/presentation/lib/cn';

export type ViewMode = 'chart' | 'table';

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  label: string;
  chartLabel: string;
  tableLabel: string;
}

const OPTIONS: ViewMode[] = ['chart', 'table'];

export function ViewModeToggle({
  value,
  onChange,
  label,
  chartLabel,
  tableLabel,
}: ViewModeToggleProps) {
  const refs = useRef<Record<ViewMode, HTMLButtonElement | null>>({ chart: null, table: null });

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !backward) return;
    event.preventDefault();
    const focused = OPTIONS.findIndex((option) => refs.current[option] === document.activeElement);
    const start = focused === -1 ? OPTIONS.indexOf(value) : focused;
    const next = OPTIONS[(start + (forward ? 1 : -1) + OPTIONS.length) % OPTIONS.length];
    if (next) refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="inline-flex rounded-panel border border-border bg-card p-1"
    >
      {OPTIONS.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            ref={(node) => {
              refs.current[option] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option)}
            className={cn(
              'rounded-[8px] px-3 py-1.5 text-2xs font-medium transition-colors duration-150',
              selected ? 'bg-primary text-white' : 'text-text-muted hover:text-text',
            )}
          >
            {option === 'chart' ? chartLabel : tableLabel}
          </button>
        );
      })}
    </div>
  );
}
