import { useState } from 'react';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { PermissionDenied } from '@/presentation/components/shared/PermissionDenied';
import { Button } from '@/presentation/components/ui/Button';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { en } from '@/presentation/i18n/en';
import { formatDate } from '@/domain/rules/date';
import { REVENUE_PERIODS } from '@/domain/rules/revenue';
import type { RevenuePeriodDays } from '@/domain/rules/revenue';
import { usePermission } from '@/presentation/hooks/usePermission';
import { useTotalRevenue } from '@/presentation/hooks/queries';
import { formatEgp } from '@/presentation/lib/format';

export function AnalyticsPage() {
  const { allowed } = usePermission('analytics.view');
  const [period, setPeriod] = useState<RevenuePeriodDays>(30);
  const revenueQuery = useTotalRevenue(period);

  if (!allowed) {
    return (
      <div>
        <PageHeader title={en.analytics.title} subtitle={en.analytics.subtitle} />
        <PermissionDenied action="analytics.view" />
      </div>
    );
  }

  const summary = revenueQuery.data;

  return (
    <div>
      <PageHeader
        title={en.analytics.title}
        subtitle={en.analytics.subtitle}
        showDemoBadge
        actions={
          <div
            role="group"
            aria-label={en.analytics.periodLabel}
            className="flex items-center gap-2"
          >
            {REVENUE_PERIODS.map((days) => (
              <Button
                key={days}
                variant={days === period ? 'primary' : 'secondary'}
                onClick={() => setPeriod(days)}
                aria-pressed={days === period}
              >
                {en.analytics.periodDays(days)}
              </Button>
            ))}
          </div>
        }
      />

      <div className="mt-6 max-w-xl rounded-card border border-border bg-card p-6 shadow-card">
        <p className="text-sm font-medium text-text-muted">{en.analytics.totalRevenue}</p>

        {revenueQuery.isLoading ? (
          <Skeleton className="mt-3 h-14 w-64" />
        ) : revenueQuery.isError ? (
          <div className="mt-3">
            <ErrorState onRetry={() => void revenueQuery.refetch()} />
          </div>
        ) : (
          <>
            <p className="text-caption font-caption mt-2 text-text">
              {formatEgp(summary?.totalEgp ?? 0)}
            </p>
            <p className="mt-3 text-sm text-text-muted">
              {formatDate(summary?.from ?? '')} – {formatDate(summary?.to ?? '')}
            </p>
            <p className="mt-1 text-2xs text-text-muted">
              {en.analytics.recordCount(summary?.recordCount ?? 0)}
            </p>
          </>
        )}
      </div>

      <p className="mt-4 max-w-xl text-2xs text-text-muted">{en.analytics.demoNote}</p>
    </div>
  );
}
