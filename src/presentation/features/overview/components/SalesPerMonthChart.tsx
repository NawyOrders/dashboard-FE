import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { en } from '@/presentation/i18n/en';
import { OVERVIEW_CHART_MONTHS } from '@/config/policy';
import { formatEgp } from '@/presentation/lib/format';
import type { SalesMonthBucket } from '@/domain/rules/sales';

export interface SalesPerMonthChartProps {
  buckets: SalesMonthBucket[];
  loading?: boolean;
}

function monthTooltip(bucket: SalesMonthBucket): string {
  return `${bucket.label}: ${formatEgp(bucket.totalEgp)}`;
}

function MonthTable({ buckets }: { buckets: SalesMonthBucket[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">{en.overview.salesChartTitle}</caption>
      <thead>
        <tr className="border-b border-border text-2xs font-medium text-text-muted">
          <th scope="col" className="px-3 py-2 text-start">
            {en.overview.month}
          </th>
          <th scope="col" className="px-3 py-2 text-end">
            {en.overview.sales}
          </th>
        </tr>
      </thead>
      <tbody>
        {buckets.map((bucket) => (
          <tr key={bucket.key} className="border-b border-border last:border-0">
            <td className="whitespace-nowrap px-3 py-2 text-text-muted">{bucket.label}</td>
            <td className="tabular px-3 py-2 text-end text-text">{formatEgp(bucket.totalEgp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SalesPerMonthChart({ buckets, loading }: SalesPerMonthChartProps) {
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...buckets.map((bucket) => bucket.totalEgp));
  const points = buckets.map((bucket, index) => {
    const xPercent = buckets.length <= 1 ? 50 : (index / (buckets.length - 1)) * 100;
    const yPercent = bucket.totalEgp === 0 ? 0 : (bucket.totalEgp / max) * 100;
    return { bucket, xPercent, yPercent };
  });
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.xPercent},${100 - point.yPercent}`,
    )
    .join(' ');

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text">{en.overview.salesChartTitle}</h2>
          <p className="mt-0.5 text-sm text-text-muted">{en.overview.chartSubtitle(OVERVIEW_CHART_MONTHS)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAsTable((value) => !value)}>
          {asTable ? en.overview.viewAsChart : en.overview.viewAsTable}
        </Button>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : asTable ? (
          <MonthTable buckets={buckets} />
        ) : (
          <div className="relative h-56">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-full w-full"
              aria-hidden="true"
            >
              <path
                d={path}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute inset-0 flex">
              {points.map(({ bucket, xPercent, yPercent }) => {
                const label = monthTooltip(bucket);
                return (
                  <Tooltip key={bucket.key} label={label} className="flex-1">
                    <button
                      type="button"
                      aria-label={label}
                      className="relative flex h-full w-full items-end justify-center"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                        style={{ bottom: `${yPercent}%`, left: `${xPercent}%` }}
                      />
                      <span className="absolute bottom-0 whitespace-nowrap text-2xs text-text-muted" style={{ left: `${xPercent}%`, transform: 'translateX(-50%)' }}>
                        {bucket.label}
                      </span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
            <div className="sr-only">
              <MonthTable buckets={buckets} />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
