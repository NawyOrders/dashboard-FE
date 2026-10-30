import { z } from 'zod';
import type {
  ApproveOnboardingResponse,
  OnboardingAssetReference,
  OnboardingBranch,
  OnboardingMenuCategory,
  OnboardingMenuItem,
  OnboardingMenuVariant,
  OnboardingRequestDetails,
  OnboardingRequestListItem,
  OnboardingRequestPage,
  OnboardingUploadFile,
  OnboardingUploadUrl,
  OnboardingUploadUrlsResponse,
  OnboardingWorkingHour,
  RejectOnboardingResponse,
  SubmitOnboardingRequest,
  SubmitOnboardingResponse,
  SubscriptionOffer,
} from '@/domain/entities';

/**
 * Zod schemas for the onboarding endpoints (agent.md section 21). Shapes come from the
 * backend swagger; every response is parsed at the infrastructure boundary.
 */

/** Response schemas receive untyped JSON, so the input side is `unknown`. */
type ResponseSchema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

const nullableString = z
  .string()
  .nullish()
  .transform((value) => value ?? null);

const nullableNumber = z
  .number()
  .nullish()
  .transform((value) => value ?? null);

export const subscriptionOfferSchema: ResponseSchema<SubscriptionOffer> = z.object({
  id: z.string().uuid(),
  packageCode: nullableString,
  termCode: nullableString,
  durationMonths: z.number().int(),
  price: z.number(),
  currency: nullableString,
});

export const offersResponseSchema = z.array(subscriptionOfferSchema);

export const onboardingRequestListItemSchema: ResponseSchema<OnboardingRequestListItem> = z.object({
  requestId: z.string().uuid(),
  restaurantNameEn: nullableString,
  restaurantNameAr: nullableString,
  ownerFullName: nullableString,
  ownerEmail: nullableString,
  ownerPhone: nullableString,
  status: z.number().int(),
  paid: z.boolean(),
  agreedPrice: nullableNumber,
  agreedCurrency: nullableString,
  branchCount: z.number().int(),
  submittedAtUtc: z.string().min(1),
});

export const onboardingRequestPageSchema: ResponseSchema<OnboardingRequestPage> = z.object({
  items: z
    .array(onboardingRequestListItemSchema)
    .nullish()
    .transform((items) => items ?? []),
  totalCount: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  totalPages: z.number().int(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export const submitOnboardingResponseSchema: ResponseSchema<SubmitOnboardingResponse> = z.object({
  requestId: z.string().uuid(),
  status: z.number().int(),
  submittedAtUtc: z.string().min(1),
});

export const approveOnboardingResponseSchema: ResponseSchema<ApproveOnboardingResponse> = z.object({
  requestId: z.string().uuid(),
  status: z.number().int(),
  tenantId: z.string().uuid(),
  tenantSlug: nullableString,
  subscriptionStartsAtUtc: nullableString,
  subscriptionEndsAtUtc: nullableString,
});

export const rejectOnboardingResponseSchema: ResponseSchema<RejectOnboardingResponse> = z.object({
  requestId: z.string().uuid(),
  status: z.number().int(),
  rejectionReason: nullableString,
  rejectedAtUtc: z.string().min(1),
});

export const onboardingWorkingHourSchema: ResponseSchema<OnboardingWorkingHour> = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isClosed: z.boolean(),
  openTime: nullableString,
  closeTime: nullableString,
  closesNextDay: z.boolean(),
});

export const onboardingBranchRequestSchema: ResponseSchema<OnboardingBranch> = z.object({
  name: nullableString,
  phone: nullableString,
  addressLine1: nullableString,
  addressLine2: nullableString,
  city: nullableString,
  region: nullableString,
  countryCode: nullableString,
  postalCode: nullableString,
  latitude: z.number(),
  longitude: z.number(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
  workingHours: z.array(onboardingWorkingHourSchema),
});

/**
 * The details endpoint returns the stored logo/menu as an asset reference. The readable
 * URL is `url`; `readUrl` is accepted as well because swagger does not pin the name.
 */
export const onboardingAssetReferenceSchema: ResponseSchema<OnboardingAssetReference> = z
  .object({
    assetId: z.string().min(1),
    url: nullableString,
    readUrl: nullableString.optional(),
  })
  .transform(({ assetId, url, readUrl }) => ({ assetId, url: url ?? readUrl ?? null }));

export const onboardingMenuVariantSchema: ResponseSchema<OnboardingMenuVariant> = z.object({
  nameEn: nullableString,
  nameAr: nullableString,
  price: nullableNumber,
});

export const onboardingMenuItemSchema: ResponseSchema<OnboardingMenuItem> = z.object({
  nameEn: nullableString,
  nameAr: nullableString,
  price: nullableNumber,
  variants: z
    .array(onboardingMenuVariantSchema)
    .nullish()
    .transform((variants) => variants ?? []),
});

export const onboardingMenuCategorySchema: ResponseSchema<OnboardingMenuCategory> = z.object({
  nameEn: nullableString,
  nameAr: nullableString,
  items: z
    .array(onboardingMenuItemSchema)
    .nullish()
    .transform((items) => items ?? []),
});

/** `GET /api/v1/onboarding-requests/{requestId}` (and the body of its PATCH response). */
export const onboardingRequestDetailsSchema: ResponseSchema<OnboardingRequestDetails> = z.object({
  requestId: z.string().uuid(),
  restaurantNameEn: nullableString,
  restaurantNameAr: nullableString,
  ownerFullName: nullableString,
  ownerEmail: nullableString,
  ownerPhone: nullableString,
  status: z.number().int(),
  paid: z.boolean(),
  agreedPrice: nullableNumber,
  agreedCurrency: nullableString,
  submittedAtUtc: z.string().min(1),
  subscriptionOffer: subscriptionOfferSchema
    .nullish()
    .transform((offer) => offer ?? null),
  branches: z
    .array(onboardingBranchRequestSchema)
    .nullish()
    .transform((branches) => branches ?? []),
  logoAsset: onboardingAssetReferenceSchema
    .nullish()
    .transform((asset) => asset ?? null),
  menuAsset: onboardingAssetReferenceSchema
    .nullish()
    .transform((asset) => asset ?? null),
  menuCategories: z
    .array(onboardingMenuCategorySchema)
    .nullish()
    .transform((categories) => categories ?? []),
  primaryColorHex: nullableString,
  secondaryColorHex: nullableString,
  accentColorHex: nullableString,
  paidAtUtc: nullableString,
  paidChangedBy: nullableString,
  approvedAtUtc: nullableString,
  approvedBy: nullableString,
  rejectedAtUtc: nullableString,
  rejectedBy: nullableString,
  rejectionReason: nullableString,
});

/** Request body of POST /api/v1/onboarding-requests. */
export const submitOnboardingRequestSchema: ResponseSchema<SubmitOnboardingRequest> = z.object({
  restaurantNameEn: nullableString,
  restaurantNameAr: nullableString,
  ownerFullName: nullableString,
  ownerEmail: nullableString,
  ownerPhone: nullableString,
  subscriptionOfferId: z.string().uuid(),
  logoAssetId: z.string().uuid(),
  logoUploadToken: nullableString,
  menuAssetId: z.string().uuid(),
  menuUploadToken: nullableString,
  branches: z.array(onboardingBranchRequestSchema),
});

export const onboardingUploadFileSchema: ResponseSchema<OnboardingUploadFile> = z.object({
  type: z.union([z.literal(1), z.literal(2)]),
  fileName: nullableString,
  contentType: nullableString,
  sizeBytes: z.number().int(),
});

export const onboardingUploadUrlSchema: ResponseSchema<OnboardingUploadUrl> = z.object({
  assetId: z.string().uuid(),
  uploadToken: nullableString,
  uploadUrl: nullableString,
  expiresAtUtc: z.string().min(1),
  contentType: nullableString,
  maximumSizeBytes: z.number().int(),
});

export const onboardingUploadUrlsResponseSchema: ResponseSchema<OnboardingUploadUrlsResponse> = z.object({
  uploads: z
    .array(onboardingUploadUrlSchema)
    .nullish()
    .transform((uploads) => uploads ?? []),
});

/** The payment PATCH answers with an empty `data`; its body is not used. */
export const paymentResponseSchema = z.unknown();
