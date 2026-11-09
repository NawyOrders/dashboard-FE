import type { HTMLAttributes } from 'react';
import { cn } from '@/presentation/lib/cn';

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

const TONES: Record<Tone, string> = {
  success: 'bg-success-bg text-success-fg',
  warning: 'bg-warning-bg text-warning-fg',
  danger: 'bg-danger-bg text-danger-fg',
  neutral: 'bg-neutral-bg text-neutral-fg',
  primary: 'bg-bg-2 text-primary-dark',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  withDot?: boolean;
}

export function Badge({ tone = 'neutral', withDot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-pill px-3 text-2xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {withDot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
