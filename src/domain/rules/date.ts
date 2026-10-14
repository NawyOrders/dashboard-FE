const MS_PER_DAY = 86_400_000;

/** Format an ISO date string for display. Locale-aware via Intl. */
export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const date = parseIsoDate(iso);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', opts ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(
    date,
  );
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function parseIsoDate(iso: string): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

/** Whole days from today until the given ISO date. Negative when in the past. */
export function daysUntil(iso: string): number {
  const date = parseIsoDate(iso);
  if (!date) return Number.NaN;
  return Math.round((date.getTime() - startOfToday().getTime()) / MS_PER_DAY);
}

/** Whole days from `from` to `to`, ignoring the time of day. Negative when `to` is earlier. */
export function daysBetween(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}
