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

const CSV_COLUMNS: CsvColumn<Tenant>[] = [
  { key: 'name', header: 'Restaurant', value: (t) => t.restaurantName },
  { key: 'business', header: 'Business', value: (t) => t.businessName },
  { key: 'tenantId', header: 'Tenant ID', value: (t) => t.tenantId },
  { key: 'package', header: 'Package', value: (t) => PACKAGES[t.subscription.packageCode].name },
  { key: 'restaurantStatus', header: 'Restaurant Status', value: (t) => t.status },
  { key: 'subscriptionStatus', header: 'Subscription Status', value: (t) => t.subscription.status },
  { key: 'start', header: 'Start Date', value: (t) => t.subscription.startDate },
  { key: 'expiry', header: 'Expiry Date', value: (t) => t.subscription.endDate },
  { key: 'branches', header: 'Branches', value: (t) => `${t.branches.length} / ${INCLUDED_BRANCHES}` },
  { key: 'website', header: 'Website', value: (t) => t.channels.websiteStatus ?? 'Not tracked' },
  { key: 'pwa', header: 'PWA', value: (t) => t.channels.pwaStatus ?? 'Not tracked' },
  { key: 'android', header: 'Android App', value: (t) => t.apps.android ?? '—' },
  { key: 'ios', header: 'iOS App', value: (t) => t.apps.ios ?? '—' },
  { key: 'created', header: 'Created', value: (t) => formatDate(t.createdAt.slice(0, 10)) },
];

const HEADERS = [
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

  function exportRows(target: Tenant[], filename: string) {
    if (target.length === 0) {
      toast({ title: 'Nothing to export', variant: 'neutral' });
      return;
    }
    downloadCsv(filename, target, CSV_COLUMNS);
    toast({ title: en.toasts.exported, description: `${target.length} rows`, variant: 'success' });
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
                        aria-label="Select all rows on this page"
                      />
                    </th>
                    {HEADERS.map((header, index) => (
                      <th
                        key={header}
                        scope="col"
                        className={cn(
                          'whitespace-nowrap px-4 py-3 text-start',
                          index === 0 && 'sticky start-12 z-10 min-w-[240px] bg-card pe-4',
                          index === HEADERS.length - 1 && 'pe-4',
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