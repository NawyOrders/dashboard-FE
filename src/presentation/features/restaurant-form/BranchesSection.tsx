import { useEffect, useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  RegistrationField,
  RegistrationMapConfig,
  RegistrationStep,
} from '@/domain/entities/registration-schema';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import { BranchMapPicker } from './BranchMapPicker';
import { SchemaField } from './SchemaField';
import type { BranchFormValue } from './form-model';

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
  /** Extra content rendered under the branch grid, e.g. the map picker. */
  renderBranchExtra?: (branch: BranchFormValue) => ReactNode;
}

function toCoordinate(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Repeatable section of the registration form (NW-246).
 *
 * The number of branches follows the limits of the selected package; the add button is
 * disabled once the maximum is reached. Every branch card can be folded away — the JSON
 * asks for the map to load only while its branch card is open.
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
  const [openBranchIds, setOpenBranchIds] = useState<string[]>(() =>
    branches.slice(0, 1).map((branch) => branch.id),
  );

  useEffect(() => {
    setOpenBranchIds((current) => {
      const known = current.filter((id) => branches.some((branch) => branch.id === id));
      const firstOpen = known.length > 0 ? known : branches.slice(0, 1).map((branch) => branch.id);
      return firstOpen;
    });
  }, [branches]);

  const atMax = branches.length >= limits.max;
  const atMin = branches.length <= limits.min;
  const mapConfig: RegistrationMapConfig | undefined = step.map;

  function toggleBranch(branchId: string) {
    setOpenBranchIds((current) =>
      current.includes(branchId)
        ? current.filter((id) => id !== branchId)
        : [...current, branchId],
    );
  }

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
        {branches.map((branch, index) => {
          const open = openBranchIds.includes(branch.id);
          return (
            <article
              key={branch.id}
              className="flex flex-col gap-4 rounded-panel border border-border bg-bg-2/40 p-4"
            >
              <header className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleBranch(branch.id)}
                  aria-expanded={open}
                  className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-text-muted transition-colors duration-150 hover:text-text"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn('size-4 transition-transform duration-150', open && 'rotate-180')}
                  />
                  {`${step.titleEn} ${index + 1}`}
                </button>
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

              {open ? (
                <>
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

                  {mapConfig ? (
                    <BranchMapPicker
                      latitude={toCoordinate(branch.fields.latitude)}
                      longitude={toCoordinate(branch.fields.longitude)}
                      onChange={(latitude, longitude) => {
                        onFieldChange(branch.id, 'latitude', String(latitude));
                        onFieldChange(branch.id, 'longitude', String(longitude));
                      }}
                      mapConfig={mapConfig}
                      disabled={disabled}
                    />
                  ) : null}

                  {renderBranchExtra?.(branch)}
                </>
              ) : null}
            </article>
          );
        })}
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
