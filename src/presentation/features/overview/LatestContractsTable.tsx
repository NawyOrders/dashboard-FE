import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { RestaurantName } from '@/presentation/components/shared/RestaurantName';
import { restaurantStatusMeta, subscriptionStatusMeta } from '@/presentation/lib/status';
import { formatDate } from '@/domain/rules/date';
import { OVERVIEW_LATEST_CONTRACTS_COUNT } from '@/config/policy';
import { en } from '@/presentation/i18n/en';
import type { OverviewLatestContract } from '@/application/dto';

export interface LatestContractsTableProps {
  rows: OverviewLatestContract[];
  loading?: boolean;
}

export function LatestContractsTable({ rows, loading }: LatestContractsTableProps) {
  const count = OVERVIEW_LATEST_CONTRACTS_COUNT;
  const headers = [
    en.restaurants.columns.restaurant,
    en.restaurants.columns.tenantId,
    en.restaurants.columns.package,
    en.overview.duration,
    en.overview.contractDate,
    en.restaurants.columns.restaurantStatus,
    en.restaurants.columns.subscriptionStatus,
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-text">{en.overview.latestTitle}</h2>
          <p className="mt-0.5 text-2xs text-text-muted">
            {en.overview.latestSubtitle(count)}
          </p>
        </div>
        <Link to="/restaurants" className="text-sm font-medium text-primary hover:text-primary-dark">
          {en.overview.viewAll}
        </Link>
      </CardHeader>

      <CardBody className="flex-1">
        {loading ? (
          <div className="flex flex-col gap-2" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={en.overview.noContractsYet} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">{en.overview.latestTitle}</caption>
              <thead>
                <tr className="border-b border-border text-2xs font-medium text-text-muted">
                  {headers.map((header) => (
                    <th key={header} scope="col" className="whitespace-nowrap px-3 py-3 text-start">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ tenant, packageCode, durationMonths, contractDate }) => (
                  <tr key={tenant.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <TenantLogo name={tenant.restaurantName} color={tenant.brandColors.primary} size="sm" />
                        <Link
                          to={`/restaurants/${tenant.id}`}
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
                      {packageCode ? (
                        <PackagePill code={packageCode} />
                      ) : (
                        <span className="text-text-muted">{en.common.notAvailable}</span>
                      )}
                    </td>
                    <td className="tabular whitespace-nowrap px-3 py-3 text-text-muted">
                      {durationMonths === null
                        ? en.common.notAvailable
                        : en.details.months(durationMonths)}
                    </td>
                    <td className="tabular whitespace-nowrap px-3 py-3 text-text-muted">
                      {formatDate(contractDate)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusPill meta={restaurantStatusMeta(tenant.status)} />
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
      </CardBody>
    </Card>
  );
}
