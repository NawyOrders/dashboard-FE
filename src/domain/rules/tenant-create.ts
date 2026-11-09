import type { CreateTenantRequest, OnboardingRequestListItem } from '@/domain/entities';
import { toTenantSlug } from './slug';

/**
 * Builds the `POST /api/v1/tenants` body from an approved onboarding request
 * (agent.md section 26). The admin password is sent as `ownerPassword` and is never
 * logged or stored by the dashboard.
 *
 * OPEN: branches and package not sent, backend to confirm
 */
export function buildCreateTenantRequest(
  request: OnboardingRequestListItem,
  ownerPassword: string,
): CreateTenantRequest {
  return {
    slug: toTenantSlug(request.restaurantNameEn ?? ''),
    restaurantNameAr: request.restaurantNameAr,
    restaurantNameEn: request.restaurantNameEn,
    ownerFullName: request.ownerFullName,
    ownerEmail: request.ownerEmail,
    ownerPhone: request.ownerPhone,
    ownerPassword,
  };
}
