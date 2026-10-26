import { useTenant } from '@/presentation/hooks/queries';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { InfoList, InfoRow } from '@/presentation/components/shared/InfoList';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { restaurantStatusMeta, subscriptionStatusMeta, channelStatusMeta, appStatusMeta } from '@/presentation/lib/status';
import { formatDate } from '@/domain/rules/date';
import { PACKAGES, PACKAGE_FEATURE_LABELS } from '@/config/packages';
import { INCLUDED_BRANCHES } from '@/config/policy';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';
import { RestaurantStatusControl } from './RestaurantStatusControl';

function ColorSwatch({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-6 rounded-[8px] border border-border" style={{ backgroundColor: color }} />
      <span className="font-mono text-mono text-text-muted">{color.toUpperCase()}</span>
    </span>
  );
}

export function OverviewTab({ tenant }: { tenant: Tenant }) {
  const { data } = useTenant(tenant.id);
  const current = data ?? tenant;
  const pkg = PACKAGES[current.subscription.packageCode];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.brand}</h3></CardHeader>
        <CardBody className="pt-0">
          <div className="mb-4 flex items-center gap-4">
            <TenantLogo name={current.restaurantName} color={current.brandColors.primary} size="lg" />
            <div>
              <p className="font-semibold text-text">{current.restaurantName}</p>
              <p className="text-sm text-text-muted">{current.businessName}</p>
            </div>
          </div>
          <InfoList>
            <InfoRow label={en.details.primaryColor}>
              <ColorSwatch color={current.brandColors.primary} />
            </InfoRow>
            <InfoRow label={en.details.secondaryColor}>
              <ColorSwatch color={current.brandColors.secondary} />
            </InfoRow>
            {current.socialLinks.website && (
              <InfoRow label="Website">
                <a
                  href={current.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {current.socialLinks.website}
                </a>
              </InfoRow>
            )}
            {current.socialLinks.instagram && (
              <InfoRow label="Instagram">
                <a
                  href={current.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {current.socialLinks.instagram}
                </a>
              </InfoRow>
            )}
          </InfoList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.contact}</h3></CardHeader>
        <CardBody className="pt-0">
          <InfoList>
            <InfoRow label="Phone">{current.contact.phone}</InfoRow>
            <InfoRow label="Email">{current.contact.email}</InfoRow>
          </InfoList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.currentPackage}</h3></CardHeader>
        <CardBody className="pt-0">
          <InfoList>
            <InfoRow label={en.details.subscriptionPackage}>
              <PackagePill code={current.subscription.packageCode} />
            </InfoRow>
            <InfoRow label={en.details.subscriptionDuration}>
              {en.details.months(current.subscription.durationMonths)}
            </InfoRow>
            <InfoRow label={en.details.subscriptionStart}>
              {formatDate(current.subscription.startDate)}
            </InfoRow>
            <InfoRow label={en.details.subscriptionEnd}>
              {formatDate(current.subscription.endDate)}
            </InfoRow>
            <InfoRow label={en.packages.feature}>
              <span className="flex flex-wrap gap-1.5">
                {pkg.features.map((feature) => (
                  <span key={feature} className="rounded-pill bg-bg-2 px-2.5 py-1 text-2xs text-primary-dark">
                    {PACKAGE_FEATURE_LABELS[feature]}
                  </span>
                ))}
              </span>
            </InfoRow>
          </InfoList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.statuses}</h3></CardHeader>
        <CardBody className="pt-0">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-2xs text-text-muted">{en.restaurants.columns.restaurantStatus}</span>
              <StatusPill meta={restaurantStatusMeta(current.status)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-2xs text-text-muted">{en.restaurants.columns.subscriptionStatus}</span>
              <StatusPill meta={subscriptionStatusMeta(current.subscription.status)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-2xs text-text-muted">{en.details.websiteStatusLabel}</span>
              <StatusPill meta={channelStatusMeta(current.channels.websiteStatus)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-2xs text-text-muted">{en.details.pwaStatusLabel}</span>
              <StatusPill meta={channelStatusMeta(current.channels.pwaStatus)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-2xs text-text-muted">{en.details.android}</span>
              <StatusPill meta={appStatusMeta(current.apps.android)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-2xs text-text-muted">{en.details.ios}</span>
              <StatusPill meta={appStatusMeta(current.apps.ios)} />
            </div>
          </div>
          <div className="mt-5 border-t border-border pt-5">
            <RestaurantStatusControl tenant={current} />
          </div>
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><h3 className="text-xl font-semibold">{en.details.branchUsage}</h3></CardHeader>
        <CardBody className="pt-0">
          <p className="text-sm text-text">
            <span className="font-semibold">{current.branches.length}</span> of {INCLUDED_BRANCHES} included
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-bg">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, (current.branches.length / INCLUDED_BRANCHES) * 100)}%` }}
            />
          </div>
          {current.branches.length > INCLUDED_BRANCHES && (
            <p className="mt-2 text-2xs text-warning-fg">
              {en.create.branches.limitNote(PACKAGES[current.subscription.packageCode].branchLimits.max)}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}