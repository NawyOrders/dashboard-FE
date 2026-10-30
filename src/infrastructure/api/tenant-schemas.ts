import { z } from 'zod';
import type {
  TenantDetails,
  TenantListItem,
  TenantPage,
  TenantPlan,
  UpdateTenantInput,
} from '@/domain/entities';

/**
 * Zod schemas for the live tenant endpoints (agent.md section 27). Shapes come from the
 * backend swagger; every response is parsed at the infrastructure boundary.
 */

/** Response schemas receive untyped JSON, so the input side is `unknown`. */
type ResponseSchema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

const nullableString = z
  .string()
  .nullish()
  .transform((value) => value ?? null);

export const tenantListItemSchema: ResponseSchema<TenantListItem> = z.object({
  tenantId: z.string().uuid(),
  slug: nullableString,
  restaurantNameAr: nullableString,
  restaurantNameEn: nullableString,
  ownerFullName: nullableString,
  ownerEmail: nullableString,
  // OPEN: the swagger does not enumerate the tenant status values.
  status: nullableString,
  createdAtUtc: z.string().min(1),
  activatedAtUtc: nullableString,
  planStatus: nullableString,
});

export const tenantPageSchema: ResponseSchema<TenantPage> = z.object({
  items: z
    .array(tenantListItemSchema)
    .nullish()
    .transform((items) => items ?? []),
  totalCount: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  totalPages: z.number().int(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export const tenantPlanSchema: ResponseSchema<TenantPlan> = z.object({
  subscriptionId: z.string().min(1),
  subscriptionOfferId: z.string().min(1),
  packageCode: nullableString,
  termCode: nullableString,
  durationMonths: z.number().int(),
  price: z.number(),
  currency: nullableString,
  status: nullableString,
  startsAtUtc: nullableString,
  endsAtUtc: nullableString,
  createdAtUtc: z.string().min(1),
});

export const tenantDetailsSchema: ResponseSchema<TenantDetails> = z.object({
  tenantId: z.string().uuid(),
  slug: nullableString,
  restaurantNameAr: nullableString,
  restaurantNameEn: nullableString,
  ownerFullName: nullableString,
  ownerEmail: nullableString,
  ownerPhone: nullableString,
  status: nullableString,
  createdAtUtc: z.string().min(1),
  activatedAtUtc: nullableString,
  provisioningError: nullableString,
  plan: tenantPlanSchema
    .nullish()
    .transform((plan) => plan ?? null),
});

/** Body of `PUT /api/v1/tenants/{tenantId}`. */
export const updateTenantRequestSchema: ResponseSchema<UpdateTenantInput> = z.object({
  slug: nullableString,
  restaurantNameAr: nullableString,
  restaurantNameEn: nullableString,
  ownerFullName: nullableString,
  ownerEmail: nullableString,
  ownerPhone: nullableString,
});

/** `GET /tenants/{tenantId}/provisioning-status`. */
export const provisioningStatusSchema = z.object({
  tenantId: z.string().uuid(),
  // OPEN: status values from backend (the contract does not enumerate them).
  status: z
    .string()
    .nullish()
    .transform((value) => value ?? ''),
  activatedAtUtc: nullableString,
  provisioningError: nullableString,
});
