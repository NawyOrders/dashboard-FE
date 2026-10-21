import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RegistrationField, RegistrationStep } from '@/domain/entities/registration-schema';
import { en } from '@/presentation/i18n/en';
import type { BranchFormValue } from './form-model';
import { SchemaField } from './SchemaField';

export interface BranchesSectionProps {
  step: RegistrationStep;
  itemFields: RegistrationField[];
  branches: BranchFormValue[];
  limits: { min: number; max: number };
  onFieldChange: (branchId: string, key: string, value: string) => void;
  onAdd: () => void;
  onRemove: (branchId: string) => void;
  disabled?: boolean;
  /** Validation messages keyed by `${branchId}.${fieldKey}`. */
  errors?: Record<string, string>;
  /** Rendered under the branch grid, e.g. the map picker of each branch. */
  renderBranchExtra?: (branch: BranchFormValue) => ReactNode;
}

/**
 * Repeatable section of the registration form (NW-246).
 *
 * The number of branches follows the limits of the selected package; the add button is
 * disabled once the maximum is reached.
 */
export function BranchesSection({
  step,
  itemFields,
  branches,
  limits,
  onFieldChange,
  onAdd,
  onRemove,
  disabled,
  errors,
  renderBranchExtra,
}: BranchesSectionProps) {
  const atMax = branches.length >= limits.max;
  const atMin = branches.length <= limits.min;

  return (
    <section className="flex flex-col gap-4" aria-label={step.titleEn}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-text">{step.titleEn}</h3>
          <p className="text-2xs text-text-muted">
            {en.registration.branchRange(limits.min, limits.max)}
          </p>
        </div>
        <span
          className="rounded-pill bg-bg-2 px-2.5 py-1 text-2xs text-text-muted"
          title={en.registration.branchLimitReached}
        >
          {branches.length} / {limits.max}
        </span>
      </header>

      <div className="flex flex-col gap-3">
        {branches.map((branch, index) => (
          <article key={branch.id} className="flex flex-col gap-4 rounded-panel border border-border bg-bg-2/40 p-4">
            <header className="flex items-center justify-between gap-3">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-muted">
                {`${step.titleEn} ${index + 1}`}
              </h4>
              <button
                type="button"
                disabled={disabled || atMin}
                onClick={() => onRemove(branch.id)}
                title={step.removeLabel ?? en.common.close}
                aria-label={step.removeLabel ?? en.common.close}
                className="inline-flex size-8 items-center justify-center rounded-panel border border-border text-text-muted transition-colors duration-150 hover:border-error hover:text-error disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-muted"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {itemFields.map((field) => (
                <SchemaField
                  key={field.key}
                  id={`rf-branch-${branch.id}-${field.key}`}
                  field={field}
                  value={branch.fields[field.key] ?? ''}
                  disabled={disabled}
                  error={errors?.[`${branch.id}.${field.key}`]}
                  onChange={(value) => onFieldChange(branch.id, field.key, value)}
                />
              ))}
            </div>

            {renderBranchExtra?.(branch)}
          </article>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || atMax}
        onClick={onAdd}
        title={atMax ? en.registration.branchLimitReached : undefined}
        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-panel border border-dashed border-border px-4 text-2xs font-medium text-text transition-colors duration-150 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-text"
      >
        <Plus aria-hidden="true" className="size-4" />
        {step.addButtonLabel ?? en.common.create}
      </button>
    </section>
  );
}
