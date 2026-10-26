import { PACKAGES } from '@/config/packages';
import type { DurationMonths, PackageCode, PackageFeatureKey } from '@/domain/entities';

/**
 * Features that can be toggled on a tenant.
 * Entitlement comes from config/packages.ts only: both packages include Android and iOS,
 * and AI is Growth-only. The UI reads entitlement from the same feature lists.
 */
export const TOGGLEABLE_FEATURES: PackageFeatureKey[] = [
  'website',
  'pwa',
  'admin_panel',
  'android_app',
  'ios_app',
];

export const GROWTH_ONLY_FEATURES: PackageFeatureKey[] = ['ai'];

export function packageHasFeature(code: PackageCode, feature: PackageFeatureKey): boolean {
  return PACKAGES[code].features.includes(feature);
}

export function isFeatureAllowedByPackage(
  packageCode: PackageCode,
  feature: PackageFeatureKey,
): boolean {
  return packageHasFeature(packageCode, feature);
}

/**
 * A feature can only be enabled if the package entitles the tenant to it.
 * Disabling is always allowed.
 */
export function canEnableFeature(
  packageCode: PackageCode,
  feature: PackageFeatureKey,
  nextEnabled: boolean,
): boolean {
  if (!nextEnabled) return true;
  return isFeatureAllowedByPackage(packageCode, feature);
}

export function getReferencePrice(code: PackageCode, duration: DurationMonths): number {
  return PACKAGES[code].prices[duration];
}
