import type { SalesRecord } from '@/domain/entities';
import { parseIsoDate } from './date';

/** A calendar month bucket used by the sales-per-month chart. */
export interface SalesMonthBucket {
  /** `yyyy-mm` key. */
  key: string;
  /** Short display label, e.g. `Oct 26`. */
  label: string;
  year: number;
  /** 0-based month index. */
  month: number;
  /** Sum of all record amounts in the month; zero months stay 0. */
  totalEgp: number;
}

const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' });

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Sum sales per calendar month for the last `months` months, oldest to newest.
 * Always returns exactly `months` buckets — months without records are shown as
 * zero, never hidden. ASSUMPTION: amounts are mock demo figures (AH-239).
 */
export function salesPerMonth(records: SalesRecord[], now: Date, months: number): SalesMonthBucket[] {
  const buckets: SalesMonthBucket[] = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      key: monthKey(cursor),
      label: MONTH_LABEL.format(cursor),
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      totalEgp: 0,
    });
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const record of records) {
    const date = parseIsoDate(record.date);
    if (!date) continue;
    const bucket = byKey.get(monthKey(date));
    if (!bucket) continue;
    bucket.totalEgp += record.amountEgp;
  }

  return buckets;
}
