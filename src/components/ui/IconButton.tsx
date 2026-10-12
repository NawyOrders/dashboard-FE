import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'white' | 'ghost';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'white', className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-panel transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'white'
          ? 'border border-border bg-card text-text hover:bg-bg-2'
          : 'bg-transparent text-text-muted hover:bg-bg-2 hover:text-text',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
