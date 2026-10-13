import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/presentation/lib/cn';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-text', className)}
    >
      <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="peer size-4 appearance-none rounded-[4px] border border-border bg-card transition-colors duration-150 checked:border-primary checked:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <Check
          aria-hidden="true"
          className="pointer-events-none absolute hidden size-3 stroke-[3] text-white peer-checked:block"
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});