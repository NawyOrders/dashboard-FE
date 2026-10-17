import type { UseCaseDeps } from '@/application/ports';
import type { RevenueSummary } from '@/application/dto';
import { countRevenueInRange, sumRevenueInRange } from '@/domain/rules/revenue';
import type { RevenuePeriodDays } from '@/domain/rules/revenue';
import { addDays, startOfToday, toIsoDate } from '@/domain/rules/date';

/**
 * Total revenue for the last `periodDays` days, computed from the mock revenue records.
 * ASSUMPTION: the window is the trailing N days ending today (inclusive); an empty window
 * sums to 0 and the UI shows the demo-data disclosure — never a fabricated figure.
 */
export function makeGetTotalRevenue(deps: UseCaseDeps) {
  return function getTotalRevenue(periodDays: RevenuePeriodDays): RevenueSummary {
    const today = startOfToday();
    const to = toIsoDate(today);
    const from = toIsoDate(addDays(today, -(periodDays - 1)));
    const records = deps.revenue.findAll();

    return {
      periodDays,
      totalEgp: sumRevenueInRange(records, from, to),
      recordCount: countRevenueInRange(records, from, to),
      from,
      to,
    };
  };
}
