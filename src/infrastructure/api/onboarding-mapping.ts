import { durationOfOffer, packageCodeOfOffer } from '@/domain/rules/packages';
import type {
  Branch,
  OnboardingBranch,
  OnboardingRequestDetails,
  OnboardingRequestListItem,
  SubscriptionOffer,
  Tenant,
  TenantMenuCategory,
} from '@/domain/entities';

/**
 * Maps an onboarding list row onto the dashboard's `Tenant` model.
 *
 * The list endpoint is the only source: branch details, logo and package dates are not
 * part of it, so those parts are empty/defaulted instead of being invented.
 */

// Owner decision: onboarding status 1 is PENDING and the Applications page lists only
// status 1, so every mapped row is pending approval.
function restaurantStatusFromOnboarding(): Tenant['status'] {
  return 'pending_approval';
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
  const durationMonths = offer ? durationOfOffer(offer) : 3;
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
      packageCode: offer ? packageCodeOfOffer(offer) : 'start',
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

/** Maps one `OnboardingRequestDetailsResponse` branch read-only for the details tab. */
export function mapOnboardingBranchToBranch(
  branch: OnboardingBranch,
  requestId: string,
  index: number,
): Branch {
  // The registration form keeps one opening window per branch; show the first open day.
  const openDay = branch.workingHours.find((hour) => !hour.isClosed && hour.openTime);

  return {
    id: `${requestId}-branch-${index + 1}`,
    tenantId: requestId,
    name: branch.name ?? '',
    address: branch.addressLine1 ?? '',
    addressLine2: branch.addressLine2,
    city: branch.city,
    region: branch.region,
    countryCode: branch.countryCode,
    postalCode: branch.postalCode,
    phone: branch.phone ?? '',
    status: 'pending',
    // The form inputs expect HH:mm; swagger times carry seconds.
    openTime: openDay?.openTime ? openDay.openTime.slice(0, 5) : null,
    closeTime: openDay?.closeTime ? openDay.closeTime.slice(0, 5) : null,
    latitude: branch.latitude,
    longitude: branch.longitude,
    workingHours: branch.workingHours,
    isPrimary: branch.isPrimary,
    sortOrder: branch.sortOrder,
  };
}

function mapMenuCategories(details: OnboardingRequestDetails): TenantMenuCategory[] {
  return details.menuCategories.map((category) => ({
    nameEn: category.nameEn,
    nameAr: category.nameAr,
    items: category.items.map((item) => ({
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      price: item.price,
      variants: item.variants.map((variant) => ({
        nameEn: variant.nameEn,
        nameAr: variant.nameAr,
        price: variant.price,
      })),
    })),
  }));
}

/** Maps `GET /onboarding-requests/{requestId}` onto the view dialog's tenant. */
export function mapOnboardingDetailsToTenant(details: OnboardingRequestDetails): Tenant {
  const offer = details.subscriptionOffer;
  const durationMonths = offer ? durationOfOffer(offer) : 3;
  const startDate = toDateOnly(details.submittedAtUtc);
  // Keep the English name field bound to the English value; the Arabic name has its own field.
  const restaurantName = details.restaurantNameEn ?? '';

  return {
    id: details.requestId,
    tenantId: details.requestId,
    businessName: details.restaurantNameEn ?? details.restaurantNameAr ?? '',
    restaurantName,
    restaurantNameAr: details.restaurantNameAr,
    contact: {
      phone: details.ownerPhone ?? '',
      email: details.ownerEmail ?? '',
      name: details.ownerFullName ?? '',
      city: null,
    },
    logoUrl: details.logoAsset?.url ?? null,
    logoAsset: details.logoAsset,
    brandColors: {
      primary: details.primaryColorHex ?? '',
      secondary: details.secondaryColorHex ?? '',
      accent: details.accentColorHex ?? '',
    },
    socialLinks: {},
    status: restaurantStatusFromOnboarding(),
    createdAt: details.submittedAtUtc,
    branches: details.branches.map((branch, index) =>
      mapOnboardingBranchToBranch(branch, details.requestId, index),
    ),
    subscription: {
      id: `onboarding-${details.requestId}`,
      tenantId: details.requestId,
      packageCode: offer ? packageCodeOfOffer(offer) : 'start',
      durationMonths,
      status: 'not_started',
      startDate,
      endDate: addMonths(startDate, durationMonths),
      updatedAt: details.submittedAtUtc,
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
    paymentStatus: details.paid ? 'paid' : 'unpaid',
    submittedAtUtc: details.submittedAtUtc,
    agreedPrice: details.agreedPrice,
    agreedCurrency: details.agreedCurrency ?? offer?.currency ?? null,
    onboardingStatus: details.status,
    subscriptionOfferId: offer?.id ?? null,
    logoAssetId: details.logoAsset?.assetId ?? null,
    menuAssetId: details.menuAsset?.assetId ?? null,
    menuCategories: mapMenuCategories(details),
    paidAtUtc: details.paidAtUtc,
    paidChangedBy: details.paidChangedBy,
    approvedAtUtc: details.approvedAtUtc,
    approvedBy: details.approvedBy,
    rejectedAtUtc: details.rejectedAtUtc,
    rejectedBy: details.rejectedBy,
    rejectionReason: details.rejectionReason,
  };
}
