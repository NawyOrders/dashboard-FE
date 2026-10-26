import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/presentation/lib/cn';

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /** Maximum length shown in the character counter. */
  maxLength?: number;
  value: string;
}

/**
 * Textarea with a character counter against the `maxLength` of the JSON field (NW-246).
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ label, error, maxLength, value, id, className, ...props }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const counterId = `${textareaId}-counter`;
    const counter = maxLength ? `${value.length} / ${maxLength}` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-2xs font-medium text-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={counter ? counterId : undefined}
          className={cn(
            'min-h-24 w-full resize-y rounded-panel border bg-card px-3 py-2 text-sm text-text',
            'placeholder:text-text-muted transition-colors duration-150 focus:border-primary focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-neutral-bg disabled:text-text-muted',
            error ? 'border-error focus:border-error' : 'border-border hover:border-border-hover',
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-2">
          {error ? (
            <span className="text-2xs text-error">{error}</span>
          ) : (
            <span />
          )}
          {counter && (
            <span id={counterId} className="text-2xs text-text-muted">
              {counter}
            </span>
          )}
        </div>
      </div>
    );
  },
);
