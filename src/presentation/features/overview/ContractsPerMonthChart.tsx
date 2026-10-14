import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { en } from '@/presentation/i18n/en';
import { OVERVIEW_CHART_MONTHS } from '@/config/policy';
import type { MonthBucket } from '@/domain/rules/overview';

export interface ContractsPerMonthChartProps {
  buckets: MonthBucket[];
  loading?: boolean;
}

const MAX_TOOLTIP_NAMES = 5;

function monthTooltip(bucket: MonthBucket): string {
  const base = `${bucket.label}: ${bucket.count} contract${bucket.count === 1 ? '' : 's'}`;
  if (bucket.restaurantNames.length === 0) return base;
  const names = bucket.restaurantNames.slice(0, MAX_TOOLTIP_NAMES);
  const extra = bucket.restaurantNames.length - names.length;
  return `${base} — ${names.join(', ')}${extra > 0 ? ` +${extra} more` : ''}`;
}

function MonthTable({ buckets }: { buckets: MonthBucket[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">{en.overview.chartTitle}</caption>
      <thead>
        <tr className="border-b border-border text-2xs font-medium text-text-muted">
          <th scope="col" className="px-3 py-2 text-start">
            {en.overview.month}
          </th>
          <th scope="col" className="px-3 py-2 text-end">
            {en.overview.contracts}
          </th>
          <th scope="col" className="px-3 py-2 text-start">
            {en.overview.restaurants}
          </th>
        </tr>
      </thead>
      <tbody>
        {buckets.map((bucket) => (
          <tr key={bucket.key} className="border-b border-border last:border-0">
            <td className="whitespace-nowrap px-3 py-2 text-text-muted">{bucket.label}</td>
            <td className="tabular px-3 py-2 text-end text-text">{bucket.count}</td>
            <td className="px-3 py-2 text-text-muted">
              {bucket.restaurantNames.length > 0
                ? bucket.restaurantNames.join(', ')
                : en.overview.noContracts}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MonthBar({ bucket, max }: { bucket: MonthBucket; max: number }) {
  const height = bucket.count === 0 ? 0 : Math.max(6, Math.round((bucket.count / max) * 100));
  const label = monthTooltip(bucket);

  return (
    <Tooltip label={label} className="flex-1" bubbleClassName="max-w-[240px] whitespace-normal text-start">
      <button
        type="button"
        aria-label={label}
        className="flex h-full w-full flex-col items-center justify-end gap-2 rounded-panel px-1 py-2 transition-colors hover:bg-bg-2"
      >
        <span className="tabular text-2xs font-medium text-text-muted">{bucket.count}</span>
        <span className="flex h-40 w-full items-end justify-center">
          <span
            className="w-full max-w-10 rounded-t-pill bg-primary-light"
            style={{ height: `${height}%` }}
          />
        </span>
        <span className="whitespace-nowrap text-2xs text-text-muted">{bucket.label}</span>
      </button>
    </Tooltip>
  );
}

export function ContractsPerMonthChart({ buckets, loading }: ContractsPerMonthChartProps) {
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-text">{en.overview.chartTitle}</h2>
          <p className="mt-0.5 text-2xs text-text-muted">
            {en.overview.chartSubtitle(OVERVIEW_CHART_MONTHS)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={asTable}
          onClick={() => setAsTable((value) => !value)}
        >
          {asTable ? en.overview.viewAsChart : en.overview.viewAsTable}
        </Button>
      </CardHeader>

      <CardBody className="flex-1">
        {loading ? (
          <div className="flex h-56 items-end gap-3" aria-hidden="true">
            {Array.from({ length: OVERVIEW_CHART_MONTHS }, (_, index) => (
              <Skeleton key={index} className="h-32 flex-1" />
            ))}
          </div>
        ) : asTable ? (
          <MonthTable buckets={buckets} />
        ) : (
          <>
            <div className="flex h-56 items-stretch gap-3">
              {buckets.map((bucket) => (
                <MonthBar key={bucket.key} bucket={bucket} max={max} />
              ))}
            </div>
            <div className="sr-only">
              <MonthTable buckets={buckets} />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
