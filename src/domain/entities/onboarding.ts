/**
 * Onboarding request contract (agent.md section 21, swagger).
 *
 * These types mirror the backend DTOs. The dashboard maps them to its own `Tenant`
 * model; they are never stored as domain state directly.
 */

/** Swagger does not name the values: 1..4 are kept as numbers. */
export interface OnboardingRequestListItem {
  requestId: string;
  restaurantNameEn: string | null;
  restaurantNameAr: string | null;
  ownerFullName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  status: number;
  paid: boolean;
  agreedPrice: number | null;
  agreedCurrency: string | null;
  branchCount: number;
  submittedAtUtc: string;
}

export interface OnboardingRequestPage {
  items: OnboardingRequestListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SubscriptionOffer {
  id: string;
  /** Raw backend value, e.g. `Start` or `Growth`. */
  packageCode: string | null;
  /** Raw backend value, e.g. `ThreeMonths`. */
  termCode: string | null;
  durationMonths: number;
  price: number;
  currency: string | null;
}

export interface OnboardingWorkingHour {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  closesNextDay: boolean;
}

export interface OnboardingBranch {
  name: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  countryCode: string | null;
  postalCode: string | null;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  sortOrder: number;
  workingHours: OnboardingWorkingHour[];
}

/** Body of `POST /api/v1/onboarding-requests` (swagger shape). */
export interface SubmitOnboardingRequest {
  restaurantNameEn: string | null;
  restaurantNameAr: string | null;
  ownerFullName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  subscriptionOfferId: string;
  logoAssetId: string;
  logoUploadToken: string | null;
  menuAssetId: string;
  menuUploadToken: string | null;
  branches: OnboardingBranch[];
}

export interface SubmitOnboardingResponse {
  requestId: string;
  status: number;
  submittedAtUtc: string;
}

/** Swagger values are unnamed: 1 = logo, 2 = menu (assumed from field order). */
export type OnboardingAssetType = 1 | 2;

export const ONBOARDING_ASSET_TYPE: Record<'logo' | 'menu', OnboardingAssetType> = {
  logo: 1,
  menu: 2,
};

export interface OnboardingUploadFile {
  type: OnboardingAssetType;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number;
}

export interface OnboardingUploadUrl {
  assetId: string;
  uploadToken: string | null;
  uploadUrl: string | null;
  expiresAtUtc: string;
  contentType: string | null;
  maximumSizeBytes: number;
}

export interface OnboardingUploadUrlsResponse {
  uploads: OnboardingUploadUrl[];
}

export interface MenuExtractionItem {
  nameAr: string | null;
  nameEn: string | null;
  price: number | null;
  variants: Record<string, number | null> | null;
  confidence: number;
  needsReview: boolean;
  hasBlockingIssues: boolean;
  issueCodes: string[] | null;
}

export interface MenuExtractionCategory {
  nameAr: string | null;
  nameEn: string | null;
  priceColumns: string[] | null;
  items: MenuExtractionItem[];
}

export interface MenuExtractionResponse {
  requestId: string | null;
  currency: string | null;
  categories: MenuExtractionCategory[];
  requiresReview: boolean;
  reliability: string | null;
  totalItems: number;
  blockingIssuesCount: number;
  needsReviewCount: number;
  processingDurationMs: number;
}
