import { PACKAGE_CURRENCY, PACKAGE_LIST } from '@/config/packages';
import type { DurationMonths, SubscriptionOffer } from '@/domain/entities';
import { DURATIONS } from '@/domain/entities';

const TERM_CODES: Record<DurationMonths, string> = {
  3: 'ThreeMonths',
  6: 'SixMonths',
  12: 'TwelveMonths',
};

/**
 * STATIC offer list. Mirrors the backend `GET /onboarding-requests/offers` shape so the
 * same UI code works in both modes; the real source in `api` mode is the backend.
 */
export const STATIC_OFFERS: SubscriptionOffer[] = PACKAGE_LIST.flatMap((pkg) =>
  DURATIONS.map((durationMonths) => ({
    id: `static-offer-${pkg.code}-${durationMonths}`,
    packageCode: pkg.code === 'growth' ? 'Growth' : 'Start',
    termCode: TERM_CODES[durationMonths],
    durationMonths,
    price: pkg.prices[durationMonths],
    currency: PACKAGE_CURRENCY,
  })),
);
