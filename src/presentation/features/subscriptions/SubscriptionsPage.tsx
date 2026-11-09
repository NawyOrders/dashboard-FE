import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { Card, CardHeader } from '@/presentation/components/ui/Card';
import { Select } from '@/presentation/components/ui/Select';
import { Checkbox } from '@/presentation/components/ui/Checkbox';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { RestaurantName } from '@/presentation/components/shared/RestaurantName';
import { ExpiryDate } from '@/presentation/components/shared/ExpiryDate';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Pagination } from '@/presentation/components/ui/Pagination';
import { useTenants } from '@/presentation/hooks/queries';
import { subscriptionStatusMeta } from '@/presentation/lib/status';
import { isExpiringSoon } from '@/domain/rules/subscription';
import { daysUntil } from '@/domain/rules/date';
import { formatDate } from '@/domain/rules/date';
import { en } from '@/presentation/i18n/en';
import { ALL_FILTER_VALUE } from '@/config/filters';
import type { PackageCode, SubscriptionStatus } from '@/domain/entities';

function DaysRemaining({ endDate, status }: { endDate: string; status: SubscriptionStatus }) {
  if (status === 'not_started') {
    return <span className="text-text-muted">{en.subscriptions.never}</span>;
  }
  const remaining = daysUntil(endDate);
  if (remaining < 0) {
    return <span className="tabular text-danger-fg">{en.subscriptions.expiredAgo(Math.abs(remaining))}</span>;
  }
  return (
    <span className="tabular text-text">
      {remaining === 0 ? en.subscriptions.today : en.subscriptions.endsIn(remaining)}
    </span>
  );
}

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubscriptionStatus | ''>('');
  const [packageCode, setPackageCode] = useState<PackageCode | ''>('');
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const allOption = { value: ALL_FILTER_VALUE, label: en.common.all };
  const statusOptions = [
    allOption,
    { value: 'active', label: en.status.subscription.active },
    { value: 'expiring_soon', label: en.status.subscription.expiring_soon },
    { value: 'expired', label: en.status.subscription.expired },
    { value: 'not_started', label: en.status.subscription.not_started },
  ];
  const packageOptions = [
    allOption,
    { value: 'start', label: 'Start' },
    { value: 'growth', label: 'Growth' },
  ];

  const query = useTenants();

  const rows = useMemo(() => {
    let result = query.data ?? [];
    if (status) result = result.filter((tenant) => tenant.subscription.status === status);
    if (packageCode) result = result.filter((tenant) => tenant.subscription.packageCode === packageCode);
    if (expiringOnly) result = result.filter((tenant) => isExpiringSoon(tenant.subscription));
    return result;
  }, [query.data, status, packageCode, expiringOnly]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      <PageHeader
        title={en.subscriptions.title}
        subtitle={en.subscriptions.subtitle}
        showDemoBadge
      />

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 lg:flex-row lg:items-end">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <Select
              label={en.subscriptions.filters.status}
              value={status || ALL_FILTER_VALUE}
              onChange={(event) => {
                setStatus(
                  event.target.value === ALL_FILTER_VALUE
                    ? ''
                    : (event.target.value as SubscriptionStatus),
                );
                setPage(1);
              }}
              options={statusOptions}
            />
            <Select
              label={en.subscriptions.filters.package}
              value={packageCode || ALL_FILTER_VALUE}
              onChange={(event) => {
                setPackageCode(
                  event.target.value === ALL_FILTER_VALUE
                    ? ''
                    : (event.target.value as PackageCode),
                );
                setPage(1);
              }}
              options={packageOptions}
            />
            <label className="flex h-11 items-center">
              <Checkbox
                label={en.subscriptions.filters.expiringSoon}
                checked={expiringOnly}
                onChange={(event) => {
                  setExpiringOnly(event.target.checked);
                  setPage(1);
                }}
              />
            </label>
          </div>
        </CardHeader>

        {query.isLoading && (
          <div className="flex flex-col gap-3 px-6 pb-6">
            <span className="sr-only">{en.common.loading}</span>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        )}

        {query.isError && (
          <div className="px-6 pb-6">
            <ErrorState onRetry={() => void query.refetch()} />
          </div>
        )}

        {query.isSuccess && rows.length === 0 && (
          <div className="px-6 pb-6">
            <EmptyState title={en.restaurants.noResults.title} description={en.restaurants.noResults.description} />
          </div>
        )}

        {query.isSuccess && pageRows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-border text-start text-2xs font-medium text-text-muted">
                    <th className="px-6 py-3 text-start font-medium">{en.restaurants.columns.restaurant}</th>
                    <th className="px-4 py-3 text-start font-medium">{en.restaurants.columns.package}</th>
                    <th className="px-4 py-3 text-start font-medium">{en.details.subscriptionDuration}</th>
                    <th className="px-4 py-3 text-start font-medium">{en.details.subscriptionStart}</th>
                    <th className="px-4 py-3 text-start font-medium">{en.restaurants.columns.expiryDate}</th>
                    <th className="px-4 py-3 text-start font-medium">{en.details.subscriptionStatus}</th>
                    <th className="px-4 py-3 text-start font-medium">{en.subscriptions.daysRemaining}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((tenant) => (
                    <tr
                      key={tenant.id}
                      onClick={() => navigate(`/restaurants/${tenant.id}?tab=subscription`)}
                      className="cursor-pointer border-b border-border transition-colors duration-150 last:border-0 hover:bg-bg-2"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="flex items-center gap-3">
                          <TenantLogo name={tenant.restaurantName} color={tenant.brandColors.primary} />
                          <span className="min-w-0">
                            <RestaurantName
                              name={tenant.restaurantName}
                              nameAr={tenant.restaurantNameAr}
                              primaryClassName="font-semibold text-text"
                              secondaryClassName="text-2xs text-text-muted"
                            />
                            <span className="block font-mono text-mono text-text-muted">{tenant.tenantId}</span>
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <PackagePill code={tenant.subscription.packageCode} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-text-muted">
                        {en.details.months(tenant.subscription.durationMonths)}
                      </td>
                      <td className="tabular whitespace-nowrap px-4 py-4 text-text-muted">
                        {formatDate(tenant.subscription.startDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <ExpiryDate endDate={tenant.subscription.endDate} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <DaysRemaining endDate={tenant.subscription.endDate} status={tenant.subscription.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={safePage}
              pageCount={pageCount}
              pageSize={pageSize}
              total={rows.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}