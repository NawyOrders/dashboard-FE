import { useActivity } from '@/hooks/queries';
import { StatusPill } from '@/components/ui/StatusPill';
import { PackagePill } from '@/components/shared/PackagePill';
import { InfoList, InfoRow } from '@/components/shared/InfoList';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { subscriptionStatusMeta } from '@/lib/status';
import { formatDate } from '@/lib/date';
import { formatEgp } from '@/lib/format';
import { PACKAGES, PACKAGE_LIST } from '@/config/packages';
import { DURATIONS } from '@/types';
import { REFERENCE_PRICE_NOTE } from '@/config/policy';
import { en } from '@/i18n/en';
import type { Tenant } from '@/types';
import { ActivityLogTable } from '@/features/activity-logs/ActivityLogTable';

const HISTORY_ACTIONS = [
  'package_changed',
  'duration_changed',
  'subscription_status_changed',
  'subscription_dates_changed',
] as const;

export function SubscriptionTab({ tenant }: { tenant: Tenant }) {
  const activity = useActivity({ tenantId: tenant.id });
  const history = (activity.data ?? []).filter((log) =>
    (HISTORY_ACTIONS as readonly string[]).includes(log.action),
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.subscriptionPackage}</h3></CardHeader>
        <CardBody className="pt-0">
          <InfoList className="sm:columns-2">
            <InfoRow label={en.details.subscriptionPackage}>
              <PackagePill code={tenant.subscription.packageCode} />
            </InfoRow>
            <InfoRow label={en.details.subscriptionDuration}>
              {en.details.months(tenant.subscription.durationMonths)}
            </InfoRow>
            <InfoRow label={en.details.subscriptionStart}>
              {formatDate(tenant.subscription.startDate)}
            </InfoRow>
            <InfoRow label={en.details.subscriptionEnd}>
              {formatDate(tenant.subscription.endDate)}
            </InfoRow>
            <InfoRow label={en.details.subscriptionStatus}>
              <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
            </InfoRow>
            <InfoRow label={en.details.currentPackage}>
              {PACKAGES[tenant.subscription.packageCode].name}
            </InfoRow>
          </InfoList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-semibold">{en.details.referencePrices}</h3>
            <p className="mt-1 text-2xs text-text-muted">{REFERENCE_PRICE_NOTE}</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="sr-only">{en.details.referencePrices}</caption>
              <thead>
                <tr className="border-y border-border text-2xs font-medium text-text-muted">
                  <th scope="col" className="px-4 py-3 text-start">{en.packages.feature}</th>
                  {DURATIONS.map((months) => (
                    <th key={months} scope="col" className="px-4 py-3 text-end">
                      {en.packages.priceFor(months)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PACKAGE_LIST.map((pkg) => (
                  <tr key={pkg.code} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-text">{pkg.name}</td>
                    {DURATIONS.map((months) => (
                      <td key={months} className="tabular whitespace-nowrap px-4 py-4 text-end text-text">
                        {formatEgp(pkg.prices[months])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.changeHistory}</h3></CardHeader>
        <ActivityLogTable
          logs={history}
          isLoading={activity.isLoading}
          isError={activity.isError}
          error={activity.error}
          onRetry={() => activity.refetch()}
          emptyMessage={en.details.noActivity}
          showTarget={false}
        />
      </Card>
    </div>
  );
}