import type { DurationMonths, Subscription, SubscriptionStatus } from '@/domain/entities';
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

/** Today's calendar date (yyyy-mm-dd) in Africa/Cairo. */
export function todayInCairo(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export type SubscriptionStartProblem = 'required' | 'invalid' | 'past';

export type SubscriptionStartResult =
  | { ok: true; startDate: string; endDate: string }
  | { ok: false; problem: SubscriptionStartProblem };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * ASSUMPTION: start date rules, owner to confirm
 *
 * The subscription start date is a real calendar date (yyyy-mm-dd) that is not earlier
 * than today in Africa/Cairo. Empty or malformed input is rejected. The end date is the
 * start date plus the package duration in months.
 */
export function resolveSubscriptionStart(
  value: string,
  durationMonths: DurationMonths,
  today: string,
): SubscriptionStartResult {
  const startDate = value.trim();
  if (!startDate) return { ok: false, problem: 'required' };
  if (!ISO_DATE.test(startDate)) return { ok: false, problem: 'invalid' };

  const start = parseIsoDate(startDate);
  const todayDate = parseIsoDate(today);
  if (!start || !todayDate || toIsoDate(start) !== startDate) {
    return { ok: false, problem: 'invalid' };
  }
  if (start.getTime() < todayDate.getTime()) return { ok: false, problem: 'past' };

  return { ok: true, startDate, endDate: endDateFromDuration(startDate, durationMonths) };
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
