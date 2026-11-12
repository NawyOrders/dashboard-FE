import type { Locale } from '@/i18n';

const PRICE_FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }),
  ar: new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }),
};

/** Formats an extracted menu price; an unparsable value is shown as typed. */
export function formatMenuPrice(value: number | string, locale: Locale): string | null {
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const amount = Number(trimmed);
  return Number.isFinite(amount) ? PRICE_FORMATTERS[locale].format(amount) : trimmed;
}
