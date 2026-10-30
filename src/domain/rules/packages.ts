import type {
  DurationMonths,
  PackageCode,
  PackageFeatureKey,
  SubscriptionOffer,
} from '@/domain/entities';

/**
 * Package entitlements and branch limits are platform rules, not catalog values.
 *
 * The selectable packages, their durations and their prices come from
 * `GET /api/v1/onboarding-requests/offers`; nothing here decides what is on sale.
 */

export const PACKAGE_CODES: PackageCode[] = ['start', 'growth'];

/** Package names are brand terms and stay as they are in both languages. */
export const PACKAGE_NAMES: Record<PackageCode, string> = {
  start: 'Start',
  growth: 'Growth',
};

// NW-246: a Start application may declare 1 to 2 branches (owner decision).
// NW-247: the branch limit is 2 for EVERY package. No extra-branch fee exists.
export const PACKAGE_BRANCH_LIMITS: Record<PackageCode, { min: number; max: number }> = {
  start: { min: 1, max: 2 },
  growth: { min: 1, max: 2 },
};

// Both packages include: website, PWA, restaurant admin panel, Android app, iOS app,
// up to 2 branches, unlimited orders, no commission.
// Growth additionally includes: AI. Start does not include AI.
const START_FEATURES: PackageFeatureKey[] = [
  'website',
  'pwa',
  'admin_panel',
  'android_app',
  'ios_app',
  'branches_up_to_2',
  'unlimited_orders',
  'no_commission',
];

export const PACKAGE_FEATURES: Record<PackageCode, PackageFeatureKey[]> = {
  start: START_FEATURES,
  growth: [...START_FEATURES, 'ai'],
};

/**
 * Features that can be toggled on a tenant.
 * Entitlement comes from `PACKAGE_FEATURES`: both packages include Android and iOS,
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
  return PACKAGE_FEATURES[code].includes(feature);
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

/** Packages the backend currently sells, in the dashboard's order; empty when offers are absent. */
export function packageCodesFromOffers(offers: SubscriptionOffer[] | undefined): PackageCode[] {
  const sold = new Set((offers ?? []).map(packageCodeOfOffer));
  return PACKAGE_CODES.filter((code) => sold.has(code));
}

/** Durations the backend currently offers, sorted; empty when offers are unavailable. */
export function durationsFromOffers(offers: SubscriptionOffer[]): DurationMonths[] {
  const durations = new Set<DurationMonths>();
  for (const offer of offers) durations.add(durationOfOffer(offer));
  return [...durations].sort((a, b) => a - b);
}
