import { endDateFromDuration, deriveSubscriptionStatus } from '@/domain/rules/subscription';
import type {
  DurationMonths,
  PackageCode,
  RestaurantStatus,
  SubscriptionStatus,
  Tenant,
  TenantDetails,
  TenantListItem,
  TenantPlan,
} from '@/domain/entities';

/**
 * Maps the live tenant DTOs onto the dashboard's `Tenant` model.
 *
 * The list endpoint is a read-only projection: branches, channels, apps and brand data
 * are not part of it, so those parts are empty/defaulted instead of being invented.
 */

// OPEN: the swagger does not enumerate the tenant status values; both lists use strings.
export function restaurantStatusFromApi(
  value: string | null | undefined,
  activatedAtUtc: string | null,
): RestaurantStatus {
  const status = (value ?? '').trim().toLowerCase().replace(/[_\s-]/g, '');
  if (status === 'active' || status === 'activated' || status === 'provisioned') return 'active';
  if (status === 'inactive' || status === 'suspended' || status === 'deactivated') return 'inactive';
  if (status === 'approved') return 'approved';
  if (status === 'pendingapproval') return 'pending_approval';
  if (status === 'failed' || status === 'provisioningfailed') {
    return activatedAtUtc ? 'inactive' : 'pending';
  }
  return activatedAtUtc ? 'active' : 'pending';
}

/** OPEN: `GET /tenants` returns the raw package code, not the dashboard code. */
export function packageCodeFromApi(value: string | null | undefined): PackageCode {
  return (value ?? '').toLowerCase().includes('growth') ? 'growth' : 'start';
}

export function durationFromApi(value: number | null | undefined): DurationMonths {
  return value === 6 || value === 12 ? value : 3;
}

function dateOnly(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function subscriptionStatusFromPlan(
  plan: TenantPlan | null,
  startDate: string,
  endDate: string,
): SubscriptionStatus {
  if (!plan) return 'not_started';
  const status = (plan.status ?? '').trim().toLowerCase();
  if (status.includes('expired') || status.includes('cancel')) return 'expired';
  if (status.includes('pending') || status.includes('notstarted')) return 'not_started';
  if (startDate && endDate) return deriveSubscriptionStatus(startDate, endDate);
  return status.includes('active') ? 'active' : 'not_started';
}

export function mapTenantListItem(item: TenantListItem): Tenant {
  const restaurantName = item.restaurantNameEn ?? item.restaurantNameAr ?? item.slug ?? '';
  const createdAt = item.createdAtUtc;

  return {
    id: item.tenantId,
    tenantId: item.tenantId,
    businessName: restaurantName,
    restaurantName,
    restaurantNameAr: item.restaurantNameAr,
    contact: {
      phone: '',
      email: item.ownerEmail ?? '',
      name: item.ownerFullName ?? '',
      city: null,
    },
    logoUrl: null,
    brandColors: { primary: '', secondary: '' },
    socialLinks: {},
    status: restaurantStatusFromApi(item.status, item.activatedAtUtc),
    createdAt,
    // OPEN: the list does not return branches, channels or apps.
    branches: [],
    subscription: {
      id: `tenant-${item.tenantId}-plan`,
      tenantId: item.tenantId,
      // OPEN: the list does not return the package; the details screen shows the plan.
      packageCode: 'start',
      durationMonths: 3,
      status: (item.planStatus ?? '').toLowerCase().includes('active') ? 'active' : 'not_started',
      startDate: dateOnly(item.activatedAtUtc),
      endDate: '',
      updatedAt: createdAt,
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
    slug: item.slug,
    planStatus: item.planStatus,
    activatedAtUtc: item.activatedAtUtc,
    provisioningError: null,
  };
}

export function mapTenantDetails(details: TenantDetails): Tenant {
  const restaurantName =
    details.restaurantNameEn ?? details.restaurantNameAr ?? details.slug ?? '';
  const plan = details.plan;
  const durationMonths = durationFromApi(plan?.durationMonths);
  const startDate = dateOnly(plan?.startsAtUtc) || dateOnly(details.createdAtUtc);
  const endDate = dateOnly(plan?.endsAtUtc) || (startDate ? endDateFromDuration(startDate, durationMonths) : '');

  return {
    id: details.tenantId,
    tenantId: details.tenantId,
    businessName: restaurantName,
    restaurantName,
    restaurantNameAr: details.restaurantNameAr,
    contact: {
      phone: details.ownerPhone ?? '',
      email: details.ownerEmail ?? '',
      name: details.ownerFullName ?? '',
      city: null,
    },
    logoUrl: null,
    brandColors: { primary: '', secondary: '' },
    socialLinks: {},
    status: restaurantStatusFromApi(details.status, details.activatedAtUtc),
    createdAt: details.createdAtUtc,
    // OPEN: the details endpoint does not return branches, channels or apps.
    branches: [],
    subscription: {
      id: plan?.subscriptionId ?? `tenant-${details.tenantId}-plan`,
      tenantId: details.tenantId,
      packageCode: packageCodeFromApi(plan?.packageCode),
      durationMonths,
      status: subscriptionStatusFromPlan(plan, startDate, endDate),
      startDate,
      endDate,
      updatedAt: plan?.createdAtUtc ?? details.createdAtUtc,
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
    slug: details.slug,
    planStatus: plan?.status ?? null,
    activatedAtUtc: details.activatedAtUtc,
    provisioningError: details.provisioningError,
  };
}
