import { TrendingUp } from 'lucide-react';
import { Card } from '@/presentation/components/ui/Card';
import { en } from '@/presentation/i18n/en';

/**
 * Reserved slot for a sales total. Rendered from `OverviewAnalysis` only when
 * `FEATURES.overviewRevenue` is true (default false). Revenue is out of scope until the
 * team approves it (agent.md §2, §4 rule 11), so no total or trend is computed here and
 * no placeholder number is shown.
 */
export function TotalSalesCard() {
  return (
    <Card className="flex items-center gap-4 p-6">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-bg text-neutral-fg">
        <TrendingUp aria-hidden="true" className="size-7" />
      </span>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-sm text-text-muted">{en.overview.revenuePending}</p>
      </div>
    </Card>
  );
}
