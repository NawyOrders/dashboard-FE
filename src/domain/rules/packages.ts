import { PACKAGES } from '@/config/packages';
import type {
  DurationMonths,
  PackageCode,
  PackageFeatureKey,
  SubscriptionOffer,
} from '@/domain/entities';

/**
 * Features that can be toggled on a tenant.
 * Entitlement comes from config/packages.ts only: both packages include Android and iOS,
 * and AI is Growth-only. The UI reads entitlement from the same feature lists.
 */
export const TOGGLEABLE_FEATURES: PackageFeatureKey[] = [
  'website',
  'pwa',
  'admin_panel',
  'android_app',
  'ios_app',
];

export const GROWTH_ONLY_FEATURES: PackageFeatureKey[] = ['ai'];

export function packageHasFeature(code: PackageCode, feature: PackageFeatureKey): boolean {
  return PACKAGES[code].features.includes(feature);
}

export function isFeatureAllowedByPackage(
  packageCode: PackageCode,
  feature: PackageFeatureKey,
): boolean {
  return packageHasFeature(packageCode, feature);
}

/**
 * A feature can only be enabled if the package entitles the tenant to it.
 * Disabling is always allowed.
 */
export function canEnableFeature(
  packageCode: PackageCode,
  feature: PackageFeatureKey,
  nextEnabled: boolean,
): boolean {
  if (!nextEnabled) return true;
  return isFeatureAllowedByPackage(packageCode, feature);
}

export function getReferencePrice(code: PackageCode, duration: DurationMonths): number {
  return PACKAGES[code].prices[duration];
}

/** OPEN: `GET /offers` returns the raw package code (`Start`/`Growth`), not the dashboard code. */
export function packageCodeOfOffer(offer: SubscriptionOffer): PackageCode {
  return (offer.packageCode ?? '').toLowerCase().includes('growth') ? 'growth' : 'start';
}

/** OPEN: the form supports 3/6/12 months; an unexpected offer duration falls back to 3. */
export function durationOfOffer(offer: SubscriptionOffer): DurationMonths {
  return offer.durationMonths === 6 || offer.durationMonths === 12 ? offer.durationMonths : 3;
}

/** The offer a package/duration selection maps to, or null when the backend does not sell it. */
export function offerForSelection(
  offers: SubscriptionOffer[] | undefined,
  code: PackageCode,
  duration: DurationMonths,
): SubscriptionOffer | null {
  return (
    offers?.find(
      (offer) => packageCodeOfOffer(offer) === code && durationOfOffer(offer) === duration,
    ) ?? null
  );
}

/** Price from `GET /offers` for the given package and duration, or null when absent. */
export function priceFromOffers(
  offers: SubscriptionOffer[] | undefined,
  code: PackageCode,
  duration: DurationMonths,
): number | null {
  return offerForSelection(offers, code, duration)?.price ?? null;
}

/** Durations the backend currently offers, sorted; empty when offers are unavailable. */
export function durationsFromOffers(offers: SubscriptionOffer[]): DurationMonths[] {
  const durations = new Set<DurationMonths>();
  for (const offer of offers) durations.add(durationOfOffer(offer));
  return [...durations].sort((a, b) => a - b);
}
