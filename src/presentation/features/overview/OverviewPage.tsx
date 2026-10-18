import { BadgeCheck, CheckCircle2, Clock, Hourglass, Store } from 'lucide-react';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { useApplications, useTenants } from '@/presentation/hooks/queries';
import { EXPIRING_SOON_DAYS } from '@/config/policy';
import { isExpiringSoon } from '@/domain/rules/subscription';
import { en } from '@/presentation/i18n/en';
import { KpiCard } from './KpiCard';
import { OverviewAnalysis } from './OverviewAnalysis';

export function OverviewPage() {
  const { data, isLoading, isError, error, refetch } = useTenants();
  const applicationsQuery = useApplications();
  const tenants = data ?? [];

  const total = tenants.length;
  const activeRestaurants = tenants.filter((tenant) => tenant.status === 'active').length;
  const activeSubscriptions = tenants.filter(
    (tenant) => tenant.subscription.status === 'active',
  ).length;
  const expiringSoon = tenants.filter((tenant) => isExpiringSoon(tenant.subscription)).length;

  return (
    <div>
      <PageHeader
        title={en.overview.greeting}
        subtitle={en.overview.subtitle}
        showDemoBadge
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label={en.overview.kpiTotal}
              value={total}
              icon={<Store aria-hidden="true" className="size-7" />}
              tint="primary"
              loading={isLoading}
            />
            <KpiCard
              label={en.overview.kpiActive}
              value={activeRestaurants}
              icon={<CheckCircle2 aria-hidden="true" className="size-7" />}
              tint="success"
              loading={isLoading}
            />
            <KpiCard
              label={en.overview.kpiActiveSubs}
              value={activeSubscriptions}
              icon={<BadgeCheck aria-hidden="true" className="size-7" />}
              tint="neutral"
              loading={isLoading}
            />
            <KpiCard
              label={en.overview.kpiExpiring}
              value={expiringSoon}
              icon={<Clock aria-hidden="true" className="size-7" />}
              tint="warning"
              loading={isLoading}
              caption={en.overview.kpiExpiringCaption(EXPIRING_SOON_DAYS)}
            />
            <KpiCard
              label={en.overview.kpiPendingApproval}
              value={applicationsQuery.data?.length ?? 0}
              icon={<Hourglass aria-hidden="true" className="size-7" />}
              tint="warning"
              loading={applicationsQuery.isLoading}
              caption={en.overview.kpiPendingApprovalCaption}
            />
          </div>

          <OverviewAnalysis />

        </>
      )}
    </div>
  );
}