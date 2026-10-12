import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-2xs font-medium text-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-11 w-full rounded-panel border bg-card px-3 text-sm text-text placeholder:text-text-muted',
          'transition-colors duration-150 focus:border-primary focus:outline-none',
          'disabled:cursor-not-allowed disabled:bg-neutral-bg disabled:text-text-muted',
          error ? 'border-danger-fg' : 'border-border',
          className,
        )}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-2xs text-danger-fg">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-hint`} className="text-2xs text-text-muted">
          {hint}
        </span>
      )}
    </div>
  );
});
