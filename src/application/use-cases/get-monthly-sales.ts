import type { Clock, SalesRepository } from '@/application/ports';
import type { SalesMonthBucket } from '@/domain/rules/sales';
import { salesPerMonth } from '@/domain/rules/sales';
import { OVERVIEW_CHART_MONTHS } from '@/config/policy';

/**
 * Sales per calendar month for the last `OVERVIEW_CHART_MONTHS` months (zero months
 * included). ASSUMPTION: values come from the deterministic mock sales series — demo
 * figures only, never presented as real platform revenue (AH-239).
 */
export function makeGetMonthlySales(sales: SalesRepository, clock: Clock) {
  return function getMonthlySales(): SalesMonthBucket[] {
    return salesPerMonth(sales.findAll(), clock.now(), OVERVIEW_CHART_MONTHS);
  };
}
