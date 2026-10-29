import { z } from 'zod';
import type { CreateTenantRequest, TenantProvisioning } from '@/domain/entities';

/**
 * Zod schemas for the tenant provisioning endpoints (agent.md section 26). The contract
 * is taken from the owner decision; no swagger file is available for these endpoints.
 */

/** Response schemas receive untyped JSON, so the input side is `unknown`. */
type ResponseSchema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

const nullableString = z
  .string()
  .nullish()
  .transform((value) => value ?? null);

/** Body of `POST /api/v1/tenants`; the slug is always generated from the English name. */
export const createTenantRequestSchema: ResponseSchema<CreateTenantRequest> = z.object({
  slug: z.string().min(1),
  restaurantNameAr: nullableString,
  restaurantNameEn: nullableString,
  ownerFullName: nullableString,
  ownerEmail: nullableString,
  ownerPhone: nullableString,
  ownerPassword: z.string().min(1),
});

/** 202 of `POST /api/v1/tenants`, and the body of GET status / POST retry. */
export const tenantProvisioningResponseSchema: ResponseSchema<TenantProvisioning> = z.object({
  tenantId: z.string().min(1),
  slug: nullableString,
  // OPEN: status values from backend (the contract does not enumerate them).
  status: z.string().min(1),
  activatedAtUtc: nullableString,
});
