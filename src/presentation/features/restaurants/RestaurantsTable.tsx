import { Card, CardHeader } from '@/presentation/components/ui/Card';
import { Checkbox } from '@/presentation/components/ui/Checkbox';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Pagination } from '@/presentation/components/ui/Pagination';
import { en } from '@/presentation/i18n/en';
import { formatDate } from '@/domain/rules/date';
import { downloadCsv } from '@/presentation/lib/csv';
import type { CsvColumn } from '@/presentation/lib/csv';
import { PACKAGES } from '@/config/packages';
import { INCLUDED_BRANCHES } from '@/config/policy';
import { cn } from '@/presentation/lib/cn';
import { useToast } from '@/presentation/hooks/useToast';
import type { Tenant } from '@/domain/entities';
import { useDirectoryState } from './useDirectoryState';
import { RestaurantToolbar } from './RestaurantToolbar';
import { ActiveFilterChips } from './ActiveFilterChips';
import { SelectionBar } from './SelectionBar';
import { RestaurantRow } from './RestaurantRow';
import { TableSkeleton } from './TableSkeleton';

function csvColumns(): CsvColumn<Tenant>[] {
  return [
    { key: 'name', header: en.restaurants.csv.restaurant, value: (t) => t.restaurantName },
    { key: 'business', header: en.restaurants.csv.business, value: (t) => t.businessName },
    { key: 'tenantId', header: en.restaurants.csv.tenantId, value: (t) => t.tenantId },
    { key: 'package', header: en.restaurants.csv.package, value: (t) => PACKAGES[t.subscription.packageCode].name },
    { key: 'restaurantStatus', header: en.restaurants.csv.restaurantStatus, value: (t) => t.status },
    { key: 'subscriptionStatus', header: en.restaurants.csv.subscriptionStatus, value: (t) => t.subscription.status },
    { key: 'start', header: en.restaurants.csv.startDate, value: (t) => t.subscription.startDate },
    { key: 'expiry', header: en.restaurants.csv.expiryDate, value: (t) => t.subscription.endDate },
    { key: 'branches', header: en.restaurants.csv.branches, value: (t) => `${t.branches.length} / ${INCLUDED_BRANCHES}` },
    { key: 'website', header: en.restaurants.csv.website, value: (t) => t.channels.websiteStatus ?? en.common.notTracked },
    { key: 'pwa', header: en.restaurants.csv.pwa, value: (t) => t.channels.pwaStatus ?? en.common.notTracked },
    { key: 'android', header: en.restaurants.csv.android, value: (t) => t.apps.android ?? en.common.notAvailable },
    { key: 'ios', header: en.restaurants.csv.ios, value: (t) => t.apps.ios ?? en.common.notAvailable },
    { key: 'created', header: en.restaurants.csv.created, value: (t) => formatDate(t.createdAt.slice(0, 10)) },
  ];
}

export interface RestaurantsTableProps {
  title?: string;
  subtitle?: string;
  initialSearch?: string;
}

export function RestaurantsTable({
  title = en.overview.allRestaurants,
  subtitle = en.overview.directorySubtitle,
  initialSearch = '',
}: RestaurantsTableProps) {
  const directory = useDirectoryState(initialSearch);
  const { toast } = useToast();
  const { query, pageRows, rows, selected } = directory;

  const hasFilters = directory.activeFilterCount > 0 || directory.searchInput.trim().length > 0;
  const pageIds = pageRows.map((t) => t.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const headers = [
    en.restaurants.columns.restaurant,
    en.restaurants.columns.tenantId,
    en.restaurants.columns.package,
    en.restaurants.columns.restaurantStatus,
    en.restaurants.columns.subscriptionStatus,
    en.restaurants.columns.startDate,
    en.restaurants.columns.expiryDate,
    en.restaurants.columns.branches,
    en.restaurants.columns.website,
    en.restaurants.columns.apps,
    en.restaurants.columns.actions,
  ];

  function exportRows(target: Tenant[], filename: string) {
    if (target.length === 0) {
      toast({ title: en.common.nothingToExport, variant: 'neutral' });
      return;
    }
    downloadCsv(filename, target, csvColumns());
    toast({ title: en.toasts.exported, description: en.common.rowsCount(target.length), variant: 'success' });
  }

  const selectedRows = rows.filter((t) => selected.has(t.id));

  return (
    <Card>
      <CardHeader className="flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-text">{title}</h2>
          <p className="mt-0.5 text-2xs font-medium text-primary">{subtitle}</p>
        </div>
        <RestaurantToolbar
          directory={directory}
          onExport={() =>
            exportRows(selectedRows.length > 0 ? selectedRows : rows, 'restaurants.csv')
          }
        />
      </CardHeader>

      <div className="px-6">
        <ActiveFilterChips
          filters={directory.filters}
          onChange={directory.setFilter}
          onClear={directory.clearFilters}
        />
        <SelectionBar
          count={selected.size}
          onDeselectAll={directory.deselectAll}
          onExport={() => exportRows(selectedRows, 'restaurants-selected.csv')}
        />

        {query.isLoading && <TableSkeleton />}

        {query.isError && (
          <div className="pb-6">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        )}

        {!query.isLoading && !query.isError && rows.length === 0 && (
          <div className="pb-6">
            {hasFilters ? (
              <EmptyState
                title={en.restaurants.noResults.title}
                description={en.restaurants.noResults.description}
                actionLabel={en.common.clearFilters}
                onAction={() => {
                  directory.clearFilters();
                  directory.setSearchInput('');
                }}
              />
            ) : (
              <EmptyState
                title={en.restaurants.empty.title}
                description={en.restaurants.empty.description}
              />
            )}
          </div>
        )}

        {!query.isLoading && !query.isError && rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-sm">
                <caption className="sr-only">{title}</caption>
                <thead>
                  <tr className="border-b border-border text-2xs font-medium text-text-muted">
                    <th scope="col" className="sticky start-0 z-10 w-12 bg-card ps-4 py-3 text-start">
                      <Checkbox
                        checked={allOnPageSelected}
                        onChange={() => directory.toggleAllOnPage(pageIds)}
                        aria-label={en.common.selectAllRows}
                      />
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={header}
                        scope="col"
                        className={cn(
                          'whitespace-nowrap px-4 py-3 text-start',
                          index === 0 && 'sticky start-12 z-10 min-w-[240px] bg-card pe-4',
                          index === headers.length - 1 && 'pe-4',
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((tenant) => (
                    <RestaurantRow
                      key={tenant.id}
                      tenant={tenant}
                      selected={selected.has(tenant.id)}
                      onToggle={directory.toggleRow}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={directory.page}
              pageCount={directory.pageCount}
              pageSize={directory.pageSize}
              total={rows.length}
              onPageChange={directory.setPage}
              onPageSizeChange={directory.setPageSize}
            />
          </>
        )}
      </div>
    </Card>
  );
}