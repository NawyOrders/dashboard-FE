import type { UpdateApplicationInput } from '@/application/dto';
import type { Branch, OnboardingBranch, SubscriptionOffer, Tenant } from '@/domain/entities';
import { buildWorkingHours } from '@/domain/rules/registration-submit';
import { offerForSelection } from '@/domain/rules/packages';
import type { Change } from '@/presentation/components/ui/ConfirmDialog';
import { en } from '@/presentation/i18n/en';
import { packageName } from '@/presentation/lib/package-copy';
import type { RestaurantFormValues } from '@/presentation/features/restaurant-form/form-model';
import { toNumberOrNull } from '@/presentation/features/restaurant-form/form-model';
import { fieldLabelByKey } from '@/presentation/features/restaurant-form/localized-schema';

/** Swagger `time` values carry seconds; the form shows `HH:mm`. */
function normalizeTime(value: string | null): string | null {
  if (!value) return null;
  return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
}

function text(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

function labelFor(key: string, scope: 'restaurant' | 'branch'): string {
  return fieldLabelByKey(key, scope) ?? key;
}

function toBaselineBranch(branch: Branch, index: number): OnboardingBranch {
  return {
    name: branch.name || null,
    phone: branch.phone || null,
    addressLine1: branch.address || null,
    addressLine2: branch.addressLine2 ?? null,
    city: branch.city ?? null,
    region: branch.region ?? null,
    countryCode: branch.countryCode ?? null,
    postalCode: branch.postalCode ?? null,
    latitude: branch.latitude ?? 0,
    longitude: branch.longitude ?? 0,
    isPrimary: branch.isPrimary ?? index === 0,
    sortOrder: branch.sortOrder ?? index,
    workingHours: (branch.workingHours ?? []).map((hour) => ({
      ...hour,
      openTime: normalizeTime(hour.openTime),
      closeTime: normalizeTime(hour.closeTime),
    })),
  };
}

function toNextBranch(
  fields: Record<string, string>,
  base: Branch | undefined,
  index: number,
  restaurantCity: string | null,
): OnboardingBranch {
  return {
    name: text(fields.name),
    phone: text(fields.phone),
    addressLine1: text(fields.address),
    addressLine2: base?.addressLine2 ?? null,
    city: base?.city ?? restaurantCity,
    region: base?.region ?? null,
    countryCode: base?.countryCode ?? null,
    postalCode: base?.postalCode ?? null,
    latitude: toNumberOrNull(fields.latitude ?? '') ?? 0,
    longitude: toNumberOrNull(fields.longitude ?? '') ?? 0,
    isPrimary: base?.isPrimary ?? index === 0,
    sortOrder: base?.sortOrder ?? index,
    workingHours: buildWorkingHours(fields.openTime, fields.closeTime),
  };
}

function sameBranch(a: OnboardingBranch, b: OnboardingBranch): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function sameNumericValue(a: string, b: string): boolean {
  return toNumberOrNull(a) === toNumberOrNull(b);
}

const BRANCH_DIFF_FIELDS = [
  'name',
  'address',
  'phone',
  'openTime',
  'closeTime',
  'latitude',
  'longitude',
] as const;

function branchFieldPrevious(base: Branch, key: (typeof BRANCH_DIFF_FIELDS)[number]): string {
  switch (key) {
    case 'name':
      return base.name;
    case 'address':
      return base.address;
    case 'phone':
      return base.phone;
    case 'openTime':
      return base.openTime ?? '';
    case 'closeTime':
      return base.closeTime ?? '';
    case 'latitude':
      return base.latitude === null || base.latitude === undefined ? '' : String(base.latitude);
    case 'longitude':
      return base.longitude === null || base.longitude === undefined
        ? ''
        : String(base.longitude);
  }
}

function sameDisplayValue(key: string, previous: string, next: string): boolean {
  if (key === 'latitude' || key === 'longitude') return sameNumericValue(previous, next);
  if (key === 'openTime' || key === 'closeTime') {
    return (normalizeTime(previous || null) ?? '') === (normalizeTime(next || null) ?? '');
  }
  return previous.trim() === next.trim();
}

export interface ApplicationChangeSet {
  /** PATCH body with only the changed fields, in the swagger-v4 shape. */
  input: UpdateApplicationInput;
  /** Previous → new value for every changed field. */
  changes: Change[];
}

/**
 * Compares the editable form values with the details baseline. Only the fields that
 * actually changed end up in the PATCH body; the same comparison feeds the change log
 * shown in the confirmation dialog.
 */
export function buildApplicationChanges(
  tenant: Tenant,
  values: RestaurantFormValues,
  offers: SubscriptionOffer[] | undefined,
): ApplicationChangeSet {
  const input: UpdateApplicationInput = {};
  const changes: Change[] = [];

  function applyText(
    key: string,
    nextValue: string,
    previousValue: string,
    apply: (value: string | null) => void,
  ) {
    if (nextValue.trim() === previousValue.trim()) return;
    const next = text(nextValue);
    apply(next);
    changes.push({
      label: labelFor(key, 'restaurant'),
      previous: previousValue.trim() || null,
      next: next ?? en.common.notAvailable,
    });
  }

  applyText('name', values.fields.name ?? '', tenant.restaurantName, (value) => {
    input.restaurantNameEn = value;
  });
  applyText('nameAr', values.fields.nameAr ?? '', tenant.restaurantNameAr ?? '', (value) => {
    input.restaurantNameAr = value;
  });
  applyText('ownerName', values.fields.ownerName ?? '', tenant.contact.name ?? '', (value) => {
    input.ownerFullName = value;
  });
  applyText('email', values.fields.email ?? '', tenant.contact.email, (value) => {
    input.ownerEmail = value;
  });
  applyText('phone', values.fields.phone ?? '', tenant.contact.phone, (value) => {
    input.ownerPhone = value;
  });

  applyText('primaryColor', values.fields.primaryColor ?? '', tenant.brandColors.primary, (value) => {
    input.primaryColorHex = value;
  });
  applyText(
    'backgroundColor',
    values.fields.backgroundColor ?? '',
    tenant.brandColors.secondary,
    (value) => {
      input.secondaryColorHex = value;
    },
  );

  const subscriptionChanged =
    values.packageCode !== tenant.subscription.packageCode ||
    values.durationMonths !== tenant.subscription.durationMonths;
  if (subscriptionChanged && offers) {
    const offer = offerForSelection(offers, values.packageCode, values.durationMonths);
    if (offer) {
      input.subscriptionOfferId = offer.id;
      input.agreedPrice = offer.price;
      input.agreedCurrency = offer.currency;
      if (values.packageCode !== tenant.subscription.packageCode) {
        changes.push({
          label: en.applications.package,
          previous: packageName(tenant.subscription.packageCode),
          next: packageName(values.packageCode),
        });
      }
      if (values.durationMonths !== tenant.subscription.durationMonths) {
        changes.push({
          label: en.registration.duration,
          previous: en.registration.months(tenant.subscription.durationMonths),
          next: en.registration.months(values.durationMonths),
        });
      }
    }
  }

  const restaurantCity = text(values.fields.city);
  const formBranchIds = new Set(values.branches.map((branch) => branch.id));
  const removedBranches = tenant.branches.filter((branch) => !formBranchIds.has(branch.id));

  const nextBranches: OnboardingBranch[] = values.branches.map((formBranch, index) => {
    const base = tenant.branches.find((branch) => branch.id === formBranch.id);
    return toNextBranch(formBranch.fields, base, index, restaurantCity);
  });

  const branchesChanged =
    removedBranches.length > 0 ||
    values.branches.length !== tenant.branches.length ||
    values.branches.some((formBranch, index) => {
      const base = tenant.branches.find((branch) => branch.id === formBranch.id);
      if (!base) return true;
      const originalIndex = tenant.branches.indexOf(base);
      return !sameBranch(
        toNextBranch(formBranch.fields, base, index, restaurantCity),
        toBaselineBranch(base, originalIndex),
      );
    });

  if (branchesChanged) {
    input.branches = nextBranches;

    values.branches.forEach((formBranch, index) => {
      const base = tenant.branches.find((branch) => branch.id === formBranch.id);
      if (!base) {
        changes.push({
          label: `${en.registration.groups.branches} ${index + 1}`,
          previous: null,
          next: text(formBranch.fields.name) ?? en.common.create,
        });
        return;
      }
      for (const key of BRANCH_DIFF_FIELDS) {
        const previous = branchFieldPrevious(base, key);
        const next = formBranch.fields[key] ?? '';
        if (sameDisplayValue(key, previous, next)) continue;
        changes.push({
          label: `${en.registration.groups.branches} ${index + 1} · ${labelFor(key, 'branch')}`,
          previous: previous.trim() || null,
          next: next.trim() || en.common.notAvailable,
        });
      }
    });

    for (const branch of removedBranches) {
      changes.push({
        label: `${en.registration.groups.branches} · ${branch.name || branch.id}`,
        previous: branch.name || null,
        next: en.common.none,
      });
    }
  }

  return { input, changes };
}
