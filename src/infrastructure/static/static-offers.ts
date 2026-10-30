import type { DurationMonths, PackageCode, SubscriptionOffer } from '@/domain/entities';
import { DURATIONS } from '@/domain/entities';
import { PACKAGE_CODES } from '@/domain/rules/packages';

const TERM_CODES: Record<DurationMonths, string> = {
  3: 'ThreeMonths',
  6: 'SixMonths',
  12: 'TwelveMonths',
};

const PACKAGE_API_CODES: Record<PackageCode, string> = {
  start: 'Start',
  growth: 'Growth',
};

// ASSUMPTION: EGP reference prices, owner to confirm. In `api` mode the catalog comes
// from `GET /api/v1/onboarding-requests/offers`; these values only drive the static demo.
const STATIC_PRICES: Record<PackageCode, Record<DurationMonths, number>> = {
  start: { 3: 15000, 6: 32000, 12: 60000 },
  growth: { 3: 17000, 6: 34000, 12: 62000 },
};

/**
 * STATIC offer list. Mirrors the backend `GET /onboarding-requests/offers` shape so the
 * same UI code works in both modes; the real source in `api` mode is the backend.
 */
export const STATIC_OFFERS: SubscriptionOffer[] = PACKAGE_CODES.flatMap((code) =>
  DURATIONS.map((durationMonths) => ({
    id: `static-offer-${code}-${durationMonths}`,
    packageCode: PACKAGE_API_CODES[code],
    termCode: TERM_CODES[durationMonths],
    durationMonths,
    price: STATIC_PRICES[code][durationMonths],
    currency: 'EGP',
  })),
);
