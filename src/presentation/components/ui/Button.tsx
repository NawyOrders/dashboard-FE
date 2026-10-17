import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/presentation/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-primary hover:bg-primary-dark active:bg-primary-dark disabled:bg-primary/50 disabled:shadow-none',
  secondary:
    'bg-card text-text border border-border shadow-sm hover:bg-bg-2 hover:border-border-hover disabled:text-text-muted',
  ghost: 'bg-transparent text-text hover:bg-bg-2 disabled:text-text-muted',
  danger: 'bg-danger-fg text-white hover:bg-primary-dark disabled:bg-danger-fg/50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-2xs rounded-panel gap-1.5',
  md: 'h-11 px-4 text-sm rounded-panel gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
