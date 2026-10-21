import { Check } from 'lucide-react';
import { PACKAGE_LIST } from '@/config/packages';
import type { PackageCode } from '@/domain/entities';
import type { BillingCycle, RegistrationStep } from '@/domain/entities/registration-schema';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';

export interface SubscriptionSectionProps {
  step: RegistrationStep;
  packageCode: PackageCode;
  billingCycle: BillingCycle;
  onPackageChange: (code: PackageCode) => void;
  onCycleChange: (cycle: BillingCycle) => void;
  disabled?: boolean;
}

/**
 * Subscription section of the registration form (NW-246).
 *
 * The billing cycle is a segmented toggle (default from the JSON) and the packages come
 * from the platform configuration; the price shown follows the selected cycle.
 */
export function SubscriptionSection({
  step,
  packageCode,
  billingCycle,
  onPackageChange,
  onCycleChange,
  disabled,
}: SubscriptionSectionProps) {
  const cycles = step.billingCycle?.options ?? (['monthly', 'yearly'] as BillingCycle[]);
  const labels: Partial<Record<BillingCycle, string>> = step.billingCycle?.labels ?? {};

  return (
    <section className="flex flex-col gap-4" aria-label={step.titleEn}>
      <header className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-text">{step.titleEn}</h3>
        <p className="text-2xs text-text-muted">{step.subtitle}</p>
      </header>

      <div
        role="radiogroup"
        aria-label={step.titleEn}
        className="inline-flex w-fit rounded-panel border border-border bg-bg-2 p-1"
      >
        {cycles.map((cycle) => {
          const selected = cycle === billingCycle;
          return (
            <button
              key={cycle}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onCycleChange(cycle)}
              className={cn(
                'rounded-panel px-4 py-1.5 text-2xs font-medium transition-colors duration-150',
                selected ? 'bg-primary text-white' : 'text-text-muted hover:text-text',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {labels[cycle] ?? (cycle === 'monthly' ? en.registration.monthly : en.registration.yearly)}
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label={en.registration.groups.subscription} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PACKAGE_LIST.map((pkg) => {
          const selected = pkg.code === packageCode;
          const price = pkg.billingPrices[billingCycle];
          return (
            <button
              key={pkg.code}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onPackageChange(pkg.code)}
              className={cn(
                'flex flex-col gap-2 rounded-panel border p-4 text-start transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
                selected ? 'border-primary bg-bg-2/60' : 'border-border hover:border-primary-light',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-text">{pkg.name}</span>
                {selected && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                )}
              </span>
              <span className="text-2xs text-text-muted">{pkg.tagline}</span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-text">{en.registration.price(price)}</span>
                <span className="text-2xs text-text-muted">
                  {billingCycle === 'monthly' ? en.registration.perMonth : en.registration.perYear}
                </span>
              </span>
              <span className="text-2xs text-text-muted">
                {en.registration.packageBranchRange(pkg.branchLimits.min, pkg.branchLimits.max)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
