import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { useMonthlySales, useOverviewAnalysis } from '@/presentation/hooks/queries';
import { ContractsPerMonthChart } from './ContractsPerMonthChart';
import { SalesPerMonthChart } from './SalesPerMonthChart';
import { LatestContractsTable } from './LatestContractsTable';
import { EndingSoonTable } from './EndingSoonTable';

/**
 * Overview analysis section: contracts-per-month and sales-per-month charts side by
 * side at ≥1280px (stacked below), then the latest-contracts and
 * subscriptions-ending-soon tables. (AH-239)
 */
export function OverviewAnalysis() {
  const query = useOverviewAnalysis();
  const salesQuery = useMonthlySales();
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
    <section className="mb-6 flex flex-col gap-6" aria-label="Overview analysis">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ContractsPerMonthChart buckets={data?.contractsPerMonth ?? []} loading={loading} />
        <SalesPerMonthChart buckets={salesQuery.data ?? []} loading={salesQuery.isLoading} />
      </div>

      <LatestContractsTable tenants={data?.latestContracts ?? []} loading={loading} />

      <EndingSoonTable entries={data?.endingSoon ?? []} loading={loading} />
    </section>
  );
}
