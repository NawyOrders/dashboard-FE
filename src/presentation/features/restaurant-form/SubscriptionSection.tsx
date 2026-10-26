import { Check } from 'lucide-react';
import { PACKAGE_FEATURE_LABELS, PACKAGE_LIST } from '@/config/packages';
import { REFERENCE_PRICE_NOTE } from '@/config/policy';
import type { DurationMonths, PackageCode, PaymentStatus } from '@/domain/entities';
import type { RegistrationStep } from '@/domain/rules/registration-schema';
import { DurationSegmented } from '@/presentation/components/shared/DurationSegmented';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import { formatEgp } from '@/presentation/lib/format';
import { paymentStatusMeta } from '@/presentation/lib/status';

export interface SubscriptionSectionProps {
  step: RegistrationStep;
  packageCode: PackageCode;
  durationMonths: DurationMonths;
  paymentStatus?: PaymentStatus;
  onPackageChange: (code: PackageCode) => void;
  onDurationChange: (duration: DurationMonths) => void;
  disabled?: boolean;
}

/**
 * Subscription section of the registration form.
 *
 * The JSON billing cycle is overridden by the owner's packages: the selector offers the
 * 3/6/12-month durations from `config/packages.ts`, and the price follows the selected
 * package and duration.
 */
export function SubscriptionSection({
  step,
  packageCode,
  durationMonths,
  paymentStatus,
  onPackageChange,
  onDurationChange,
  disabled,
}: SubscriptionSectionProps) {
  return (
    <section className="flex flex-col gap-4" aria-label={step.titleEn}>
      <header className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-text">{step.titleEn}</h3>
        <p className="text-2xs text-text-muted">{step.subtitle}</p>
      </header>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-medium text-text">{en.registration.duration}</span>
          <DurationSegmented value={durationMonths} onChange={onDurationChange} disabled={disabled} />
        </div>
        {paymentStatus ? (
          <div className="flex flex-col gap-2">
            <span className="text-2xs font-medium text-text">{en.registration.paymentStatus}</span>
            <StatusPill meta={paymentStatusMeta(paymentStatus)} />
          </div>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label={en.registration.groups.subscription}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {PACKAGE_LIST.map((pkg) => {
          const selected = pkg.code === packageCode;
          const price = pkg.prices[durationMonths];
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
              <span className="flex flex-wrap gap-1">
                {pkg.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-pill bg-card px-2 py-0.5 text-2xs text-text-muted"
                  >
                    {PACKAGE_FEATURE_LABELS[feature]}
                  </span>
                ))}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-lg font-semibold text-text">{formatEgp(price)}</span>
                <span className="text-2xs text-text-muted">{en.registration.durationNote}</span>
              </span>
              <span className="text-2xs text-text-muted">
                {en.registration.packageBranchRange(pkg.branchLimits.min, pkg.branchLimits.max)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-2xs text-text-muted">{REFERENCE_PRICE_NOTE}</p>
    </section>
  );
}
