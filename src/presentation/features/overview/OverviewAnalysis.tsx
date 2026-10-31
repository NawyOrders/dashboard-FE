import { ErrorState } from '@/presentation/components/ui/ErrorState';
import {
  useMonthlySales,
  useOverviewAnalysis,
  useOverviewEndingSoon,
  useOverviewLatestContracts,
  useTenants,
} from '@/presentation/hooks/queries';
import { ContractsPerMonthChart } from './ContractsPerMonthChart';
import { SalesPerMonthChart } from './components/SalesPerMonthChart';
import { LatestContractsTable } from './LatestContractsTable';
import { EndingSoonTable } from './EndingSoonTable';
import { en } from '@/presentation/i18n/en';

/**
 * Overview analysis section: contracts-per-month and sales-per-month charts side by
 * side at ≥1280px (stacked below), then the latest-contracts and
 * subscriptions-ending-soon tables. (AH-239)
 */
export function OverviewAnalysis() {
  const query = useOverviewAnalysis();
  const salesQuery = useMonthlySales();
  const tenantsQuery = useTenants();
  const latestQuery = useOverviewLatestContracts(
    tenantsQuery.data,
    tenantsQuery.dataUpdatedAt,
  );
  const endingQuery = useOverviewEndingSoon(
    tenantsQuery.data,
    tenantsQuery.dataUpdatedAt,
  );
  const data = query.data;
  const loading = query.isLoading;

  if (query.isError || salesQuery.isError) {
    return (
      <div className="mb-6">
        <ErrorState
          error={query.error ?? salesQuery.error}
          onRetry={() => {
            if (query.isError) void query.refetch();
            if (salesQuery.isError) void salesQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <section className="mb-6 flex flex-col gap-6" aria-label={en.overview.analysisLabel}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ContractsPerMonthChart buckets={data?.contractsPerMonth ?? []} loading={loading} />
        <SalesPerMonthChart buckets={salesQuery.data ?? []} loading={salesQuery.isLoading} />
      </div>

      <LatestContractsTable
        rows={latestQuery.data ?? []}
        loading={tenantsQuery.isLoading || latestQuery.isLoading}
      />

      <EndingSoonTable
        entries={endingQuery.data?.entries ?? []}
        loading={tenantsQuery.isLoading || endingQuery.isLoading}
        failedCount={endingQuery.data?.failedCount ?? 0}
        onRetry={() => void endingQuery.refetch()}
      />
    </section>
  );
}
