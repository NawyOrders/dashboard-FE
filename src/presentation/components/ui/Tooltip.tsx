import type { ReactNode } from 'react';
import { cn } from '@/presentation/lib/cn';

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'right';
  bubbleClassName?: string;
  className?: string;
}

/** CSS-only tooltip triggered on hover and keyboard focus. */
export function Tooltip({ label, children, side = 'top', bubbleClassName, className }: TooltipProps) {
  const position =
    side === 'top'
      ? 'bottom-full mb-2 start-1/2 -translate-x-1/2'
      : side === 'bottom'
        ? 'top-full mt-2 start-1/2 -translate-x-1/2'
        : 'start-full ms-2 top-1/2 -translate-y-1/2';

  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-30 hidden max-w-xs whitespace-nowrap rounded-pill bg-text px-2 py-1 text-2xs text-white',
          'group-hover:block group-focus-within:block',
          position,
          bubbleClassName,
        )}
      >
        {label}
      </span>
    </span>
  );
}