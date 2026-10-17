import type { RevenueRecord } from '@/domain/entities';

export type RevenuePeriodDays = 30 | 90 | 365;

export const REVENUE_PERIODS: RevenuePeriodDays[] = [30, 90, 365];

/**
 * Sum of all records with `from <= date <= to` (inclusive). ASSUMPTION: an empty range
 * returns 0 rather than throwing — the page renders an explicit zero, never a fake value.
 */
export function sumRevenueInRange(records: RevenueRecord[], from: string, to: string): number {
  return records
    .filter((record) => record.date >= from && record.date <= to)
    .reduce((total, record) => total + record.amountEgp, 0);
}

export function countRevenueInRange(records: RevenueRecord[], from: string, to: string): number {
  return records.filter((record) => record.date >= from && record.date <= to).length;
}
