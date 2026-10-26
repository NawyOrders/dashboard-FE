import type {
  DurationMonths,
  OnboardingRequestListItem,
  PackageCode,
  SubscriptionOffer,
  Tenant,
} from '@/domain/entities';

/**
 * Maps an onboarding list row onto the dashboard's `Tenant` model.
 *
 * The list endpoint is the only source: branch details, logo and package dates are not
 * part of it, so those parts are empty/defaulted instead of being invented.
 */

// OPEN: swagger does not name the onboarding status values. The Applications page
// reviews pending requests, so every listed request is treated as pending approval.
function restaurantStatusFromOnboarding(): Tenant['status'] {
  return 'pending_approval';
}

/** OPEN: `Start`/`Growth` is the documented package value; anything else defaults to Start. */
export function packageCodeFromOffer(value: string | null): PackageCode {
  return (value ?? '').toLowerCase().includes('growth') ? 'growth' : 'start';
}

/** OPEN: the form supports 3/6/12 months; an unexpected backend duration falls back to 3. */
export function durationFromOffer(months: number): DurationMonths {
  return months === 6 || months === 12 ? months : 3;
}

function toDateOnly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function addMonths(dateOnly: string, months: number): string {
  const date = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return dateOnly;
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

/** Matches the price the request was submitted with to the offer it was submitted for. */
export function findOfferForRequest(
  item: OnboardingRequestListItem,
  offers: SubscriptionOffer[],
): SubscriptionOffer | null {
  if (item.agreedPrice !== null) {
    const match = offers.find(
      (offer) =>
        offer.price === item.agreedPrice &&
        (item.agreedCurrency === null || offer.currency === item.agreedCurrency),
    );
    if (match) return match;
  }
  // OPEN: the list does not return the offer id; without a price match the first offer
  // keeps the subscription fields usable while the backend adds the offer to the row.
  return offers[0] ?? null;
}

export function mapOnboardingRequestToTenant(
  item: OnboardingRequestListItem,
  offers: SubscriptionOffer[],
): Tenant {
  const offer = findOfferForRequest(item, offers);
  const durationMonths = offer ? durationFromOffer(offer.durationMonths) : 3;
  const startDate = toDateOnly(item.submittedAtUtc);
  const restaurantName = item.restaurantNameEn ?? item.restaurantNameAr ?? '';
  const branchCount = Math.max(0, item.branchCount);

  return {
    id: item.requestId,
    tenantId: item.requestId,
    businessName: restaurantName,
    restaurantName,
    restaurantNameAr: item.restaurantNameAr,
    contact: {
      phone: item.ownerPhone ?? '',
      email: item.ownerEmail ?? '',
      name: item.ownerFullName ?? '',
      city: null,
    },
    logoUrl: null,
    brandColors: { primary: '', secondary: '' },
    socialLinks: {},
    status: restaurantStatusFromOnboarding(),
    createdAt: item.submittedAtUtc,
    branches: Array.from({ length: branchCount }, (_, index) => ({
      id: `${item.requestId}-branch-${index + 1}`,
      tenantId: item.requestId,
      name: '',
      address: '',
      phone: '',
      status: 'pending' as const,
    })),
    subscription: {
      id: `onboarding-${item.requestId}`,
      tenantId: item.requestId,
      packageCode: offer ? packageCodeFromOffer(offer.packageCode) : 'start',
      durationMonths,
      status: 'not_started',
      startDate,
      endDate: addMonths(startDate, durationMonths),
      updatedAt: item.submittedAtUtc,
    },
    channels: {
      websiteStatus: null,
      pwaStatus: null,
      websiteUrl: null,
      pwaUrl: null,
      previewUrl: null,
    },
    apps: {
      android: null,
      ios: null,
      androidStoreUrl: null,
      iosStoreUrl: null,
    },
    description: null,
    coverImageUrl: null,
    commercialRegisterNumber: null,
    paymentStatus: item.paid ? 'paid' : 'unpaid',
    submittedAtUtc: item.submittedAtUtc,
    agreedPrice: item.agreedPrice,
    agreedCurrency: item.agreedCurrency,
    onboardingStatus: item.status,
  };
}
