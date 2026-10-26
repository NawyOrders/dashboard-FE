import { z } from 'zod';
import type {
  MenuExtractionCategory,
  MenuExtractionItem,
  MenuExtractionResponse,
  OnboardingBranch,
  OnboardingRequestListItem,
  OnboardingRequestPage,
  OnboardingUploadFile,
  OnboardingUploadUrl,
  OnboardingUploadUrlsResponse,
  OnboardingWorkingHour,
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

export const menuExtractionItemSchema: ResponseSchema<MenuExtractionItem> = z.object({
  nameAr: nullableString,
  nameEn: nullableString,
  price: nullableNumber,
  variants: z.record(z.number().nullable()).nullish().transform((value) => value ?? null),
  confidence: z.number(),
  needsReview: z.boolean(),
  hasBlockingIssues: z.boolean(),
  issueCodes: z
    .array(z.string())
    .nullish()
    .transform((value) => value ?? null),
});

export const menuExtractionCategorySchema: ResponseSchema<MenuExtractionCategory> = z.object({
  nameAr: nullableString,
  nameEn: nullableString,
  priceColumns: z
    .array(z.string())
    .nullish()
    .transform((value) => value ?? null),
  items: z
    .array(menuExtractionItemSchema)
    .nullish()
    .transform((items) => items ?? []),
});

export const menuExtractionResponseSchema: ResponseSchema<MenuExtractionResponse> = z.object({
  requestId: nullableString,
  currency: nullableString,
  categories: z
    .array(menuExtractionCategorySchema)
    .nullish()
    .transform((categories) => categories ?? []),
  requiresReview: z.boolean(),
  reliability: nullableString,
  totalItems: z.number().int(),
  blockingIssuesCount: z.number().int(),
  needsReviewCount: z.number().int(),
  processingDurationMs: z.number().int(),
});

/** The payment PATCH answers with an empty `data`; its body is not used. */
export const paymentResponseSchema = z.unknown();
