/**
 * Tenant endpoints of the live backend (agent.md section 27).
 *
 * These types mirror the swagger DTOs of `GET /tenants`, `GET /tenants/{tenantId}` and
 * the provisioning/plan actions. The dashboard maps them onto its own `Tenant` model.
 */

export interface TenantListItem {
  tenantId: string;
  slug: string | null;
  restaurantNameAr: string | null;
  restaurantNameEn: string | null;
  ownerFullName: string | null;
  ownerEmail: string | null;
  /** Raw backend status; the swagger does not enumerate the values. */
  status: string | null;
  createdAtUtc: string;
  activatedAtUtc: string | null;
  planStatus: string | null;
}

export interface TenantPage {
  items: TenantListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TenantPlan {
  subscriptionId: string;
  subscriptionOfferId: string;
  packageCode: string | null;
  termCode: string | null;
  durationMonths: number;
  price: number;
  currency: string | null;
  status: string | null;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
  createdAtUtc: string;
}

export interface TenantDetails {
  tenantId: string;
  slug: string | null;
  restaurantNameAr: string | null;
  restaurantNameEn: string | null;
  ownerFullName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  status: string | null;
  createdAtUtc: string;
  activatedAtUtc: string | null;
  provisioningError: string | null;
  plan: TenantPlan | null;
}

/** Body of `PUT /api/v1/tenants/{tenantId}`. */
export interface UpdateTenantInput {
  slug: string | null;
  restaurantNameAr: string | null;
  restaurantNameEn: string | null;
  ownerFullName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
}
