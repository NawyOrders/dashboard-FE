/**
 * Onboarding request contract (agent.md section 21, swagger).
 *
 * These types mirror the backend DTOs. The dashboard maps them to its own `Tenant`
 * model; they are never stored as domain state directly.
 */

/** Swagger does not name the values: 1..4 are kept as numbers. */
export type OnboardingRequestStatus = number | string;

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

/** A stored onboarding file (logo or menu) as the details endpoint returns it. */
export interface OnboardingAssetReference {
  assetId: string;
  /** Readable URL the browser can load; `null` when the backend only returns the id. */
  url: string | null;
}

export interface OnboardingMenuVariant {
  nameEn: string | null;
  nameAr: string | null;
  price: number | null;
}

export interface OnboardingMenuItem {
  nameEn: string | null;
  nameAr: string | null;
  price: number | null;
  variants: OnboardingMenuVariant[];
}

export interface OnboardingMenuCategory {
  nameEn: string | null;
  nameAr: string | null;
  items: OnboardingMenuItem[];
}

/** Body of `PATCH /api/v1/onboarding-requests/{requestId}`; partial data is allowed. */
export interface UpdateOnboardingRequest {
  restaurantNameEn?: string | null;
  restaurantNameAr?: string | null;
  ownerFullName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  subscriptionOfferId?: string;
  logoAssetId?: string;
  logoUploadToken?: string | null;
  menuAssetId?: string;
  menuUploadToken?: string | null;
  branches?: OnboardingBranch[];
  primaryColorHex?: string | null;
  secondaryColorHex?: string | null;
  accentColorHex?: string | null;
  agreedPrice?: number | null;
  agreedCurrency?: string | null;
}

/**
 * `GET /api/v1/onboarding-requests/{requestId}`. The list row plus the parts the list
 * omits: the offer, the branches, the assets, the menu and the audit fields.
 */
export interface OnboardingRequestDetails {
  requestId: string;
  restaurantNameEn: string | null;
  restaurantNameAr: string | null;
  ownerFullName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  /** The list uses the numeric 1..4 enum; the details endpoint returns text. */
  status: OnboardingRequestStatus | null;
  paid: boolean;
  agreedPrice: number | null;
  agreedCurrency: string | null;
  submittedAtUtc: string;
  subscriptionOffer: SubscriptionOffer | null;
  branches: OnboardingBranch[];
  logoAsset: OnboardingAssetReference | null;
  menuAsset: OnboardingAssetReference | null;
  menuCategories: OnboardingMenuCategory[];
  primaryColorHex: string | null;
  secondaryColorHex: string | null;
  accentColorHex: string | null;
  paidAtUtc: string | null;
  paidChangedBy: string | null;
  approvedAtUtc: string | null;
  approvedBy: string | null;
  rejectedAtUtc: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
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

/** 200 of `POST /api/v1/onboarding-requests/{requestId}/approve`. */
export interface ApproveOnboardingResponse {
  requestId: string;
  status: number;
  tenantId: string;
  tenantSlug: string | null;
  subscriptionStartsAtUtc: string | null;
  subscriptionEndsAtUtc: string | null;
}

/** 200 of `POST /api/v1/onboarding-requests/{requestId}/reject`. */
export interface RejectOnboardingResponse {
  requestId: string;
  status: number;
  rejectionReason: string | null;
  rejectedAtUtc: string;
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

