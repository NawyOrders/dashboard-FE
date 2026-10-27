import { Fragment } from 'react';
import type {
  DurationMonths,
  PackageCode,
  PaymentStatus,
  SubscriptionOffer,
} from '@/domain/entities';
import type { RegistrationSection, RegistrationStep } from '@/domain/rules/registration-schema';
import { en } from '@/presentation/i18n/en';
import { BranchesSection } from './BranchesSection';
import { SchemaField } from './SchemaField';
import { SubscriptionSection } from './SubscriptionSection';
import { FORM_GROUP_IDS } from './form-groups';
import { RESTAURANT_NAME_AR_FIELD } from './form-model';
import { fieldLabel } from './localized-schema';
import type { RestaurantFormValues } from './form-model';

export interface RestaurantFormProps {
  steps: RegistrationStep[];
  values: RestaurantFormValues;
  branchLimits: { min: number; max: number };
  paymentStatus?: PaymentStatus;
  onFieldChange: (key: string, value: string) => void;
  onBranchFieldChange: (branchId: string, key: string, value: string) => void;
  onAddBranch: () => void;
  onRemoveBranch: (branchId: string) => void;
  onPackageChange?: (code: PackageCode) => void;
  onDurationChange?: (duration: DurationMonths) => void;
  disabled?: boolean;
  /** Offers from `GET /offers`; package availability, durations and prices come from them. */
  offers?: SubscriptionOffer[];
  /** View dialog: the submitted subscription is shown read-only. */
  subscriptionReadOnly?: boolean;
  /** Price the request was submitted with (`agreedPrice` from the onboarding list). */
  submittedPrice?: number | null;
  /** Validation messages keyed by the JSON field key. */
  errors?: Record<string, string>;
  /** Validation messages keyed by `${branchId}.${fieldKey}`. */
  branchErrors?: Record<string, string>;
}

function sectionTitle(section: RegistrationSection, step: RegistrationStep): string {
  const known = en.registration.sections[section.id as keyof typeof en.registration.sections];
  return known ?? step.titleEn;
}

// OPEN: cover image cancelled, confirm and update JSON.
const HIDDEN_FIELD_KEYS = new Set(['coverImageUrl']);

function visibleFields(section: RegistrationSection) {
  return (section.fields ?? []).filter((field) => !HIDDEN_FIELD_KEYS.has(field.key));
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
        {visibleFields(section).map((field) => {
          const value = values[field.key] ?? '';
          if (field.type === 'image') {
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <span className="text-2xs font-medium text-text">
                  {fieldLabel(field, 'restaurant')}
                </span>
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
                <span className="text-2xs font-medium text-text">
                  {fieldLabel(field, 'restaurant')}
                </span>
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
              <span className="text-2xs font-medium text-text">
                {fieldLabel(field, 'restaurant')}
              </span>
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
  paymentStatus,
  onFieldChange,
  onBranchFieldChange,
  onAddBranch,
  onRemoveBranch,
  onPackageChange,
  onDurationChange,
  disabled,
  offers,
  subscriptionReadOnly,
  submittedPrice,
  errors,
  branchErrors,
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
                  {visibleFields(section).map((field) => (
                    <Fragment key={field.key}>
                      <SchemaField
                        id={`rf-field-${field.key}`}
                        field={field}
                        scope="restaurant"
                        value={values.fields[field.key] ?? ''}
                        disabled={disabled}
                        error={errors?.[field.key]}
                        onChange={(value) => onFieldChange(field.key, value)}
                      />
                      {field.key === 'name' ? (
                        <SchemaField
                          id={`rf-field-${RESTAURANT_NAME_AR_FIELD.key}`}
                          field={RESTAURANT_NAME_AR_FIELD}
                          scope="restaurant"
                          value={values.fields[RESTAURANT_NAME_AR_FIELD.key] ?? ''}
                          disabled={disabled}
                          error={errors?.[RESTAURANT_NAME_AR_FIELD.key]}
                          onChange={(value) =>
                            onFieldChange(RESTAURANT_NAME_AR_FIELD.key, value)
                          }
                        />
                      ) : null}
                    </Fragment>
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
          />
        </div>
      ) : null}

      {subscriptionStep ? (
        <div id={FORM_GROUP_IDS.subscription}>
          <SubscriptionSection
            step={subscriptionStep}
            packageCode={values.packageCode}
            durationMonths={values.durationMonths}
            paymentStatus={paymentStatus}
            disabled={disabled}
            offers={offers}
            readOnly={subscriptionReadOnly}
            submittedPrice={submittedPrice}
            onPackageChange={onPackageChange}
            onDurationChange={onDurationChange}
          />
        </div>
      ) : null}
    </div>
  );
}
