import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { RestaurantName } from '@/presentation/components/shared/RestaurantName';
import { subscriptionStatusMeta } from '@/presentation/lib/status';
import { formatDate } from '@/domain/rules/date';
import { OVERVIEW_ENDING_WITHIN_DAYS } from '@/config/policy';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import type { EndingSoonEntry } from '@/domain/rules/overview';

export interface EndingSoonTableProps {
  entries: EndingSoonEntry[];
  loading?: boolean;
  error?: unknown;
  /** Details calls that failed; shown as a warning with a retry action. */
  failedCount?: number;
  onRetry?: () => void;
}

const URGENT_DAYS = 3;

function DaysRemaining({ days }: { days: number }) {
  const urgent = days <= URGENT_DAYS;
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 whitespace-nowrap font-medium',
        urgent ? 'text-danger-fg' : 'text-warning-fg',
      )}
    >
      <span className="tabular">{days}</span>
      <span className="text-2xs">{en.overview.daysLeft(days)}</span>
    </span>
  );
}

export function EndingSoonTable({
  entries,
  loading,
  error,
  failedCount = 0,
  onRetry,
}: EndingSoonTableProps) {
  const days = OVERVIEW_ENDING_WITHIN_DAYS;
  return (
    <Card>
      <CardHeader className="items-center">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-text">
            {en.overview.endingTitle(days)}
          </h2>
          <p className="mt-0.5 text-2xs text-text-muted">
            {en.overview.endingSubtitle(days)}
          </p>
        </div>
      </CardHeader>

      <CardBody>
        {error !== undefined && error !== null ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <>
            {failedCount > 0 && !loading && (
              <div
                role="alert"
                className="mb-3 flex flex-wrap items-center gap-3 rounded-panel border border-warning-fg bg-warning-bg px-4 py-3 text-sm text-warning-fg"
              >
                <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 flex-1">{en.overview.endingCheckFailed}</span>
                {onRetry && (
                  <Button size="sm" variant="secondary" onClick={onRetry}>
                    {en.common.retry}
                  </Button>
                )}
              </div>
            )}
            {loading ? (
              <div className="flex flex-col gap-2" aria-hidden="true">
                {Array.from({ length: URGENT_DAYS }, (_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <EmptyState title={en.overview.endingEmpty(days)} />
            ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <caption className="sr-only">{en.overview.endingTitle(days)}</caption>
              <thead>
                <tr className="border-b border-border text-2xs font-medium text-text-muted">
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-start">
                    {en.restaurants.columns.restaurant}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-start">
                    {en.restaurants.columns.tenantId}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-start">
                    {en.restaurants.columns.package}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-start">
                    {en.restaurants.columns.expiryDate}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-start">
                    {en.overview.daysRemainingColumn}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-start">
                    {en.restaurants.columns.subscriptionStatus}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map(({ tenant, daysRemaining }) => (
                  <tr key={tenant.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <TenantLogo name={tenant.restaurantName} color={tenant.brandColors.primary} size="sm" />
                        <Link
                          to={`/restaurants/${tenant.id}?tab=subscription`}
                          title={tenant.restaurantName}
                          className="max-w-[200px]"
                        >
                          <RestaurantName
                            name={tenant.restaurantName}
                            nameAr={tenant.restaurantNameAr}
                            primaryClassName="font-semibold text-text hover:text-primary"
                            secondaryClassName="text-2xs font-normal text-text-muted"
                          />
                        </Link>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="font-mono text-mono text-text-muted">{tenant.tenantId}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <PackagePill code={tenant.subscription.packageCode} />
                    </td>
                    <td className="tabular whitespace-nowrap px-3 py-3 text-text-muted">
                      {formatDate(tenant.subscription.endDate)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <DaysRemaining days={daysRemaining} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
