import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { en } from '@/presentation/i18n/en';
import { OVERVIEW_CHART_MONTHS } from '@/config/policy';
import { formatEgp } from '@/presentation/lib/format';
import { computeMax } from '@/presentation/charts/line-chart';
import { LineChart } from './LineChart';
import type { SalesMonthBucket } from '@/domain/rules/sales';

export interface SalesPerMonthChartProps {
  buckets: SalesMonthBucket[];
  loading?: boolean;
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
  const allZero = computeMax(buckets) <= 0;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text">{en.overview.salesChartTitle}</h2>
          <p className="mt-0.5 text-sm text-text-muted">{en.overview.chartSubtitle(OVERVIEW_CHART_MONTHS)}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={asTable}
          onClick={() => setAsTable((value) => !value)}
        >
          {asTable ? en.overview.viewAsChart : en.overview.viewAsTable}
        </Button>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : asTable ? (
          <MonthTable buckets={buckets} />
        ) : (
          <>
            <LineChart buckets={buckets} />
            {allZero ? (
              <p className="mt-2 text-center text-sm text-text-muted">{en.overview.noSales}</p>
            ) : null}
            <div className="sr-only">
              <MonthTable buckets={buckets} />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
