import type { Tenant } from '@/domain/entities';
import { daysBetween, parseIsoDate } from './date';

/** A calendar month bucket used by the contracts-per-month chart. */
export interface MonthBucket {
  /** `yyyy-mm` key. */
  key: string;
  /** Short display label, e.g. `Oct 26`. */
  label: string;
  year: number;
  /** 0-based month index. */
  month: number;
  count: number;
  restaurantNames: string[];
}

/** A subscription that ends within the configured window. */
export interface EndingSoonEntry {
  tenant: Tenant;
  daysRemaining: number;
}

const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' });

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Count contracts (subscription start date) per calendar month for the last `months`
 * months, oldest to newest. Always returns exactly `months` buckets — zero months are
 * shown as zero-height entries, never hidden.
 */
export function contractsPerMonth(tenants: Tenant[], now: Date, months: number): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      key: monthKey(cursor),
      label: MONTH_LABEL.format(cursor),
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      count: 0,
      restaurantNames: [],
    });
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const tenant of tenants) {
    const contractDate = parseIsoDate(tenant.subscription.startDate);
    if (!contractDate) continue;
    const bucket = byKey.get(monthKey(contractDate));
    if (!bucket) continue;
    bucket.count += 1;
    bucket.restaurantNames.push(tenant.restaurantName);
  }

  return buckets;
}

/**
 * Most recently signed contracts, sorted by contract date descending and then by
 * Tenant ID descending as a tie-breaker.
 */
export function latestContracts(tenants: Tenant[], count: number): Tenant[] {
  return [...tenants]
    .sort((a, b) => {
      const byDate = b.subscription.startDate.localeCompare(a.subscription.startDate);
      return byDate !== 0 ? byDate : b.tenantId.localeCompare(a.tenantId);
    })
    .slice(0, Math.max(0, count));
}

// OPEN: contract date rule (activatedAtUtc vs createdAtUtc), owner to confirm.
export function contractDate(tenant: Tenant): string {
  return tenant.activatedAtUtc ?? tenant.createdAt;
}

function contractTime(tenant: Tenant): number {
  const time = new Date(contractDate(tenant)).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Most recently activated contracts (the live tenant list has no plan dates), sorted by
 * activation date descending and then by Tenant ID descending as a tie-breaker.
 */
export function latestContractsByActivation(tenants: Tenant[], count: number): Tenant[] {
  return [...tenants]
    .sort((a, b) => {
      const byDate = contractTime(b) - contractTime(a);
      return byDate !== 0 ? byDate : b.tenantId.localeCompare(a.tenantId);
    })
    .slice(0, Math.max(0, count));
}

/**
 * Subscriptions with `0 ≤ daysRemaining ≤ days`, sorted by days remaining ascending
 * (most urgent first). Already expired subscriptions (negative remaining) are excluded.
 */
export function endingSoon(tenants: Tenant[], now: Date, days: number): EndingSoonEntry[] {
  const entries: EndingSoonEntry[] = [];
  for (const tenant of tenants) {
    const end = parseIsoDate(tenant.subscription.endDate);
    if (!end) continue;
    const remaining = daysBetween(now, end);
    if (remaining < 0 || remaining > days) continue;
    entries.push({ tenant, daysRemaining: remaining });
  }

  return entries.sort(
    (a, b) => a.daysRemaining - b.daysRemaining || a.tenant.tenantId.localeCompare(b.tenant.tenantId),
  );
}
