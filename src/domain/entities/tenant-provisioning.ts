/**
 * Tenant provisioning contract (agent.md section 26).
 *
 * Approving an application creates a tenant with `POST /api/v1/tenants`. The dashboard
 * never stores the admin password: it is sent once in the request body and never logged.
 */

/** Body of `POST /api/v1/tenants`. */
export interface CreateTenantRequest {
  slug: string;
  restaurantNameAr: string | null;
  restaurantNameEn: string | null;
  ownerFullName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  /** Admin password of the restaurant account; sent only in this request. */
  ownerPassword: string;
}

/**
 * Provisioning state returned by the tenant create, status and retry endpoints.
 *
 * OPEN: status values from backend (the contract does not enumerate them).
 */
export interface TenantProvisioning {
  tenantId: string;
  slug: string | null;
  status: string;
  activatedAtUtc: string | null;
}
