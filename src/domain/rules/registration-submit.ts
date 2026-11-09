import type {
  OnboardingBranch,
  OnboardingWorkingHour,
  SubmitOnboardingRequest,
  SubscriptionOffer,
} from '@/domain/entities';

/**
 * Builds the swagger body of `POST /api/v1/onboarding-requests` from the registration
 * form. Sending stays disabled: the api adapter guards the call with
 * `// OPEN: backend submit not finished`.
 */
export interface RegistrationSubmitValues {
  fields: Record<string, string>;
  branches: Array<{ fields: Record<string, string> }>;
}

export interface OnboardingSubmitAsset {
  assetId: string;
  uploadToken: string | null;
}

export interface OnboardingSubmitContext {
  /** Offer selected in the form; its id becomes `subscriptionOfferId`. */
  offer: SubscriptionOffer;
  logo: OnboardingSubmitAsset;
  menu: OnboardingSubmitAsset;
}

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

function text(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

function toNumberOrNull(raw: string | undefined): number | null {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Swagger `time` values carry seconds; the form inputs yield `HH:mm`. */
function swaggerTime(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  return /^\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
}

/**
 * The JSON stores one opening window per branch, so the same window is sent for every
 * day. `closesNextDay` is inferred from a closing time at or before the opening time.
 * Shared with the onboarding PATCH body.
 */
export function buildWorkingHours(
  rawOpenTime: string | undefined,
  rawCloseTime: string | undefined,
): OnboardingWorkingHour[] {
  const openTime = swaggerTime(rawOpenTime);
  const closeTime = swaggerTime(rawCloseTime);
  const isClosed = openTime === null || closeTime === null;
  const closesNextDay = openTime !== null && closeTime !== null && closeTime <= openTime;

  return WEEK_DAYS.map((dayOfWeek) => ({
    dayOfWeek,
    isClosed,
    openTime: isClosed ? null : openTime,
    closeTime: isClosed ? null : closeTime,
    closesNextDay: isClosed ? false : closesNextDay,
  }));
}

function buildBranch(
  values: RegistrationSubmitValues,
  branch: { fields: Record<string, string> },
  index: number,
): OnboardingBranch {
  const latitude = toNumberOrNull(branch.fields.latitude);
  const longitude = toNumberOrNull(branch.fields.longitude);

  return {
    name: text(branch.fields.name),
    phone: text(branch.fields.phone),
    addressLine1: text(branch.fields.address),
    // OPEN: the registration JSON has a single address line; line 2 is not collected.
    addressLine2: null,
    // OPEN: branch city is not in the JSON; the restaurant city is reused for each branch.
    city: text(values.fields.city),
    // OPEN: region is not collected by the registration form.
    region: null,
    // OPEN: country code is not in the form; Egypt is assumed.
    countryCode: 'EG',
    // OPEN: postal code is not collected by the registration form.
    postalCode: null,
    // OPEN: swagger requires coordinates; 0,0 marks a point that was never picked.
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
    isPrimary: index === 0,
    sortOrder: index,
    workingHours: buildWorkingHours(branch.fields.openTime, branch.fields.closeTime),
  };
}

/**
 * OPEN: not in submit DTO, backend to confirm. The commercial register number and the
 * admin password stay on their current flows and are deliberately not sent here.
 */
export function buildOnboardingSubmitBody(
  values: RegistrationSubmitValues,
  context: OnboardingSubmitContext,
): SubmitOnboardingRequest {
  return {
    restaurantNameEn: text(values.fields.name),
    restaurantNameAr: text(values.fields.nameAr),
    ownerFullName: text(values.fields.ownerName),
    ownerEmail: text(values.fields.email),
    ownerPhone: text(values.fields.phone),
    subscriptionOfferId: context.offer.id,
    logoAssetId: context.logo.assetId,
    logoUploadToken: context.logo.uploadToken,
    menuAssetId: context.menu.assetId,
    menuUploadToken: context.menu.uploadToken,
    branches: values.branches.map((branch, index) => buildBranch(values, branch, index)),
  };
}
