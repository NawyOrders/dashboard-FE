import type { ReactNode } from 'react';
import type { PackageCode } from '@/domain/entities';
import type { BillingCycle, RegistrationSection, RegistrationStep } from '@/domain/entities/registration-schema';
import { en } from '@/presentation/i18n/en';
import { BranchesSection } from './BranchesSection';
import { SchemaField } from './SchemaField';
import { SubscriptionSection } from './SubscriptionSection';
import { FORM_GROUP_IDS } from './form-groups';
import type { BranchFormValue, RestaurantFormValues } from './form-model';

export interface RestaurantFormProps {
  steps: RegistrationStep[];
  values: RestaurantFormValues;
  branchLimits: { min: number; max: number };
  onFieldChange: (key: string, value: string) => void;
  onBranchFieldChange: (branchId: string, key: string, value: string) => void;
  onAddBranch: () => void;
  onRemoveBranch: (branchId: string) => void;
  onPackageChange: (code: PackageCode) => void;
  onCycleChange: (cycle: BillingCycle) => void;
  disabled?: boolean;
  /** Validation messages keyed by the JSON field key. */
  errors?: Record<string, string>;
  /** Validation messages keyed by `${branchId}.${fieldKey}`. */
  branchErrors?: Record<string, string>;
  /** Extra content rendered under every branch, e.g. the map picker. */
  renderBranchExtra?: (branch: BranchFormValue) => ReactNode;
}

function sectionTitle(section: RegistrationSection, step: RegistrationStep): string {
  const known = en.registration.sections[section.id as keyof typeof en.registration.sections];
  return known ?? step.titleEn;
}

/** Values of a read-only section (`editable: false`) rendered as text. */
function ReadOnlySection({
  section,
  step,
  values,
}: {
  section: RegistrationSection;
  step: RegistrationStep;
  values: Record<string, string>;
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={sectionTitle(section, step)}>
      <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-muted">
        {sectionTitle(section, step)}
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {section.fields.map((field) => {
          const value = values[field.key] ?? '';
          if (field.type === 'image') {
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <span className="text-2xs font-medium text-text">{field.label}</span>
                <span className="flex size-16 items-center justify-center overflow-hidden rounded-panel border border-border bg-bg-2">
                  {value ? (
                    <img src={value} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-2xs text-text-muted">{en.common.notAvailable}</span>
                  )}
                </span>
              </div>
            );
          }
          if (field.type === 'color') {
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <span className="text-2xs font-medium text-text">{field.label}</span>
                <span className="flex items-center gap-2 text-sm text-text">
                  <span
                    aria-hidden="true"
                    className="size-6 rounded-panel border border-border"
                    style={{ backgroundColor: value || 'transparent' }}
                  />
                  <span className="font-mono text-xs">{value || en.common.notAvailable}</span>
                </span>
              </div>
            );
          }
          return (
            <div key={field.key} className="flex flex-col gap-1">
              <span className="text-2xs font-medium text-text">{field.label}</span>
              <span className="truncate text-sm text-text">{value || en.common.notAvailable}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Schema-driven registration form (NW-246).
 *
 * Every section, field, branch row and control comes from the JSON schema; the component
 * only arranges them in the layout of the reference design.
 */
export function RestaurantForm({
  steps,
  values,
  branchLimits,
  onFieldChange,
  onBranchFieldChange,
  onAddBranch,
  onRemoveBranch,
  onPackageChange,
  onCycleChange,
  disabled,
  errors,
  branchErrors,
  renderBranchExtra,
}: RestaurantFormProps) {
  const detailsSteps = steps.filter((step) => step.sections && step.sections.length > 0);
  const branchesStep = steps.find((step) => step.repeatable === true);
  const subscriptionStep = steps.find((step) => step.billingCycle !== undefined);

  return (
    <div className="flex flex-col gap-8">
      <div id={FORM_GROUP_IDS.details} className="flex flex-col gap-6">
        {detailsSteps.map((step) =>
          (step.sections ?? []).map((section) =>
            section.editable === false ? (
              <ReadOnlySection key={section.id} section={section} step={step} values={values.fields} />
            ) : (
              <section key={section.id} className="flex flex-col gap-3" aria-label={sectionTitle(section, step)}>
                <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-muted">
                  {sectionTitle(section, step)}
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <SchemaField
                      key={field.key}
                      id={`rf-field-${field.key}`}
                      field={field}
                      value={values.fields[field.key] ?? ''}
                      disabled={disabled}
                      error={errors?.[field.key]}
                      onChange={(value) => onFieldChange(field.key, value)}
                    />
                  ))}
                </div>
              </section>
            ),
          ),
        )}
      </div>

      {branchesStep ? (
        <div id={FORM_GROUP_IDS.branches}>
          <BranchesSection
            step={branchesStep}
            itemFields={branchesStep.itemFields ?? []}
            branches={values.branches}
            limits={branchLimits}
            disabled={disabled}
            errors={branchErrors}
            onFieldChange={onBranchFieldChange}
            onAdd={onAddBranch}
            onRemove={onRemoveBranch}
            renderBranchExtra={renderBranchExtra}
          />
        </div>
      ) : null}

      {subscriptionStep ? (
        <div id={FORM_GROUP_IDS.subscription}>
          <SubscriptionSection
            step={subscriptionStep}
            packageCode={values.packageCode}
            billingCycle={values.billingCycle}
            disabled={disabled}
            onPackageChange={onPackageChange}
            onCycleChange={onCycleChange}
          />
        </div>
      ) : null}
    </div>
  );
}
