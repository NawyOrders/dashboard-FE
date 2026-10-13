import type { UseFormReturn } from 'react-hook-form';
import { Badge } from '@/presentation/components/ui/Badge';
import { InfoList, InfoRow } from '@/presentation/components/shared/InfoList';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { PACKAGES, PACKAGE_FEATURE_LABELS } from '@/config/packages';
import { INCLUDED_BRANCHES } from '@/config/policy';
import { en } from '@/presentation/i18n/en';
import type { CreateRestaurantValues } from './schema';

export function ReviewStep({ form }: { form: UseFormReturn<CreateRestaurantValues> }) {
  const values = form.watch();
  const pkg = PACKAGES[values.packageCode];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-text">{en.create.review.summary}</h3>
        <InfoList>
          <InfoRow label={en.create.basics.businessName}>{values.businessName || '—'}</InfoRow>
          <InfoRow label={en.create.basics.restaurantName}>{values.restaurantName || '—'}</InfoRow>
          <InfoRow label={en.create.basics.phone}>{values.contact.phone || '—'}</InfoRow>
          <InfoRow label={en.create.basics.email}>{values.contact.email || '—'}</InfoRow>
          <InfoRow label={en.create.subscription.package}>
            <PackagePill code={values.packageCode} />
          </InfoRow>
          <InfoRow label={en.create.subscription.duration}>
            {en.details.months(values.durationMonths)}
          </InfoRow>
          <InfoRow label={en.create.subscription.restaurantStatus}>
            {en.status.restaurant[values.status]}
          </InfoRow>
          <InfoRow label={en.create.subscription.startDate}>{values.startDate || '—'}</InfoRow>
          <InfoRow label={en.create.subscription.endDate}>{values.endDate || '—'}</InfoRow>
          <InfoRow label={en.create.branches.title}>
            {values.branches.length} / {INCLUDED_BRANCHES}
          </InfoRow>
        </InfoList>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold text-text">{en.create.review.enabledFeatures}</h3>
        <ul className="flex flex-wrap gap-2">
          {pkg.features.map((feature) => (
            <li key={feature}>
              <Badge tone="success" withDot>
                {PACKAGE_FEATURE_LABELS[feature]}
              </Badge>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-2xs text-text-muted">{pkg.tagline}</p>
        {values.branches.length > INCLUDED_BRANCHES && (
          <p className="mt-3 rounded-panel bg-warning-bg px-4 py-3 text-2xs text-warning-fg">
            {en.create.branches.limitNote}
          </p>
        )}
      </div>
    </div>
  );
}