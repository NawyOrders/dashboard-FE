import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { useOverviewAnalysis } from '@/presentation/hooks/queries';
import { FEATURES } from '@/config/policy';
import { ContractsPerMonthChart } from './ContractsPerMonthChart';
import { LatestContractsTable } from './LatestContractsTable';
import { EndingSoonTable } from './EndingSoonTable';
import { TotalSalesCard } from './TotalSalesCard';

/**
 * Overview analysis section (Phase 3b): contracts-per-month chart, latest contracts and
 * subscriptions ending within the configured window. The sales total card is rendered only
 * when `FEATURES.overviewRevenue` is true; while false the grid reflows and shows nothing.
 */
export function OverviewAnalysis() {
  const query = useOverviewAnalysis();
  const data = query.data;
  const loading = query.isLoading;

  if (query.isError) {
    return (
      <div className="mb-6">
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </div>
    );
  }

  return (
    <section className="mb-6 flex flex-col gap-6" aria-label="Overview analysis">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ContractsPerMonthChart buckets={data?.contractsPerMonth ?? []} loading={loading} />
        <LatestContractsTable tenants={data?.latestContracts ?? []} loading={loading} />
      </div>

      {FEATURES.overviewRevenue && <TotalSalesCard />}

      <EndingSoonTable entries={data?.endingSoon ?? []} loading={loading} />
    </section>
  );
}
