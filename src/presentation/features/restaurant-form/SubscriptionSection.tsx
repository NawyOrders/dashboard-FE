import { Check } from 'lucide-react';
import type {
  DurationMonths,
  PackageCode,
  PaymentStatus,
  SubscriptionOffer,
} from '@/domain/entities';
import {
  PACKAGE_BRANCH_LIMITS,
  PACKAGE_CODES,
  PACKAGE_FEATURES,
  durationsFromOffers,
  packageCodesFromOffers,
  priceFromOffers,
} from '@/domain/rules/packages';
import type { RegistrationStep } from '@/domain/rules/registration-schema';
import { DurationSegmented } from '@/presentation/components/shared/DurationSegmented';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import { formatEgp } from '@/presentation/lib/format';
import { packageFeatureLabel, packageName, packageTagline } from '@/presentation/lib/package-copy';
import { paymentStatusMeta } from '@/presentation/lib/status';
import { stepSubtitle, stepTitle } from './localized-schema';

export interface SubscriptionSectionProps {
  step: RegistrationStep;
  packageCode: PackageCode;
  durationMonths: DurationMonths;
  paymentStatus?: PaymentStatus;
  onPackageChange?: (code: PackageCode) => void;
  onDurationChange?: (duration: DurationMonths) => void;
  disabled?: boolean;
  /** Offers from `GET /offers`; they drive the selectable packages, durations and prices. */
  offers?: SubscriptionOffer[];
  /** View dialog: the submitted subscription is shown, never edited. */
  readOnly?: boolean;
  /** Price the request was submitted with (`agreedPrice` from the onboarding list). */
  submittedPrice?: number | null;
}

function ReadOnlySubscription({
  step,
  packageCode,
  durationMonths,
  paymentStatus,
  offers,
  submittedPrice,
}: Pick<
  SubscriptionSectionProps,
  'step' | 'packageCode' | 'durationMonths' | 'paymentStatus' | 'offers' | 'submittedPrice'
>) {
  const price = submittedPrice ?? priceFromOffers(offers, packageCode, durationMonths);

  const fields = [
    { label: en.details.subscriptionPackage, value: packageName(packageCode) },
    { label: en.registration.duration, value: en.registration.months(durationMonths) },
    {
      label: en.registration.price,
      value: price === null ? en.common.notAvailable : formatEgp(price),
    },
  ];

  return (
    <section className="flex flex-col gap-4" aria-label={stepTitle(step)}>
      <header className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-text">{stepTitle(step)}</h3>
        <p className="text-2xs text-text-muted">{stepSubtitle(step)}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-1">
            <span className="text-2xs font-medium text-text">{field.label}</span>
            <span className="text-sm text-text">{field.value}</span>
          </div>
        ))}
      </div>

      {paymentStatus ? (
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-medium text-text">{en.registration.paymentStatus}</span>
          <StatusPill meta={paymentStatusMeta(paymentStatus)} />
        </div>
      ) : null}
    </section>
  );
}

/**
 * Subscription section of the registration form.
 *
 * The JSON billing cycle is overridden by the offers returned from `GET /offers`: the
 * selector only offers the packages and durations the backend accepts, and the price
 * follows the selected offer. In the view dialog the submitted package, duration and
 * price are read-only.
 */
export function SubscriptionSection({
  step,
  packageCode,
  durationMonths,
  paymentStatus,
  onPackageChange,
  onDurationChange,
  disabled,
  offers,
  readOnly,
  submittedPrice,
}: SubscriptionSectionProps) {
  if (readOnly) {
    return (
      <ReadOnlySubscription
        step={step}
        packageCode={packageCode}
        durationMonths={durationMonths}
        paymentStatus={paymentStatus}
        offers={offers}
        submittedPrice={submittedPrice}
      />
    );
  }

  const hasOffers = offers !== undefined && offers.length > 0;
  const offeredCodes = hasOffers ? packageCodesFromOffers(offers) : [];
  const packageOptions = offeredCodes.length > 0 ? offeredCodes : PACKAGE_CODES;
  const durationOptions = hasOffers ? durationsFromOffers(offers) : undefined;
  const priceFor = (code: PackageCode, duration: DurationMonths) =>
    priceFromOffers(offers, code, duration);

  return (
    <section className="flex flex-col gap-4" aria-label={stepTitle(step)}>
      <header className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-text">{stepTitle(step)}</h3>
        <p className="text-2xs text-text-muted">{stepSubtitle(step)}</p>
      </header>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-medium text-text">{en.registration.duration}</span>
          <DurationSegmented
            value={durationMonths}
            options={durationOptions}
            onChange={(duration) => onDurationChange?.(duration)}
            disabled={disabled}
          />
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
        {packageOptions.map((code) => {
          const selected = code === packageCode;
          const price = priceFor(code, durationMonths);
          const branchLimits = PACKAGE_BRANCH_LIMITS[code];
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onPackageChange?.(code)}
              className={cn(
                'flex flex-col gap-2 rounded-panel border p-4 text-start transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
                selected ? 'border-primary bg-bg-2/60' : 'border-border hover:border-primary-light',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-text">{packageName(code)}</span>
                {selected && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                )}
              </span>
              <span className="text-2xs text-text-muted">{packageTagline(code)}</span>
              <span className="flex flex-wrap gap-1">
                {PACKAGE_FEATURES[code].map((feature) => (
                  <span
                    key={feature}
                    className="rounded-pill bg-card px-2 py-0.5 text-2xs text-text-muted"
                  >
                    {packageFeatureLabel(feature)}
                  </span>
                ))}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-lg font-semibold text-text">
                  {price === null ? en.common.notAvailable : formatEgp(price)}
                </span>
                <span className="text-2xs text-text-muted">{en.registration.durationNote}</span>
              </span>
              <span className="text-2xs text-text-muted">
                {en.registration.packageBranchRange(branchLimits.min, branchLimits.max)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-2xs text-text-muted">{en.registration.referencePriceNote}</p>
    </section>
  );
}
