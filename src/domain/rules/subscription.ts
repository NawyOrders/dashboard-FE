import type { Subscription, SubscriptionStatus } from '@/domain/entities';
import { EXPIRING_SOON_DAYS } from '@/config/policy';
import { addMonths, daysUntil, parseIsoDate, startOfToday, toIsoDate } from './date';

export function daysRemaining(sub: Subscription): number {
  return daysUntil(sub.endDate);
}

/**
 * "Expiring soon" is display-oriented. The subscription `status` field remains the
 * authoritative label; this helper is used for the filter, the KPI and date highlighting.
 */
export function isExpiringSoon(sub: Subscription, threshold = EXPIRING_SOON_DAYS): boolean {
  if (sub.status === 'expired' || sub.status === 'not_started') return false;
  const remaining = daysRemaining(sub);
  return remaining >= 0 && remaining <= threshold;
}

export function isActiveSubscription(sub: Subscription): boolean {
  return sub.status === 'active';
}

/** Derive an end date from a start date and a duration in months. */
export function endDateFromDuration(startDate: string, months: number): string {
  const start = parseIsoDate(startDate) ?? startOfToday();
  return toIsoDate(addMonths(start, months));
}

/**
 * Derive the subscription status from its dates. Used on creation (the subscription
 * form lets the admin override the status afterwards).
 */
export function deriveSubscriptionStatus(
  startDate: string,
  endDate: string,
  today: Date = startOfToday(),
  threshold = EXPIRING_SOON_DAYS,
): SubscriptionStatus {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return 'not_started';

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (start.getTime() > todayStart.getTime()) return 'not_started';
  if (end.getTime() < todayStart.getTime()) return 'expired';
  if (end.getTime() - todayStart.getTime() <= threshold * 86_400_000) return 'expiring_soon';
  return 'active';
}
