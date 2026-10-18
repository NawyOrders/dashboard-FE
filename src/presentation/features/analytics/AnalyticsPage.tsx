import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { PermissionDenied } from '@/presentation/components/shared/PermissionDenied';
import { Card, CardHeader } from '@/presentation/components/ui/Card';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { en } from '@/presentation/i18n/en';
import { usePermission } from '@/presentation/hooks/usePermission';
import { useMonthlySales, useOverviewAnalysis } from '@/presentation/hooks/queries';
import { ContractsPerMonthChart } from '@/presentation/features/overview/ContractsPerMonthChart';
import { SalesPerMonthChart } from '@/presentation/features/overview/SalesPerMonthChart';

/**
 * Analytics page: the same contracts-per-month and sales-per-month charts shown on
 * the Overview (same components, same repository queries) plus a Power BI placeholder.
 * No revenue/sales total figure is displayed — the definition is still open (AH-239).
 */
export function AnalyticsPage() {
  const { allowed } = usePermission('analytics.view');
  const overviewQuery = useOverviewAnalysis();
  const salesQuery = useMonthlySales();

  if (!allowed) {
    return (
      <div>
        <PageHeader title={en.analytics.title} subtitle={en.analytics.subtitle} />
        <PermissionDenied action="analytics.view" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={en.analytics.title} subtitle={en.analytics.subtitle} showDemoBadge />

      {overviewQuery.isError || salesQuery.isError ? (
        <ErrorState
          error={overviewQuery.error ?? salesQuery.error}
          onRetry={() => {
            if (overviewQuery.isError) void overviewQuery.refetch();
            if (salesQuery.isError) void salesQuery.refetch();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ContractsPerMonthChart
            buckets={overviewQuery.data?.contractsPerMonth ?? []}
            loading={overviewQuery.isLoading}
          />
          <SalesPerMonthChart buckets={salesQuery.data ?? []} loading={salesQuery.isLoading} />
        </div>
      )}

      <Card className="mt-6">
        <CardHeader className="items-start">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-bg text-neutral-fg">
            <BarChart3 aria-hidden="true" className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-text">{en.analytics.powerBiTitle}</h2>
            <p className="mt-0.5 text-sm text-text-muted">{en.analytics.powerBiBody}</p>
          </div>
        </CardHeader>
      </Card>

      <p className="mt-4 max-w-xl text-2xs text-text-muted">{en.analytics.demoNote}</p>
    </div>
  );
}
