import { PACKAGES } from '@/config/packages';
import type { DurationMonths, PackageCode, PackageFeatureKey } from '@/domain/entities';

/**
 * Features that can be toggled on a tenant.
 * The UI must never allow enabling Android/iOS for a Start tenant; that is enforced here
 * and mirrored in the UI (disabled toggle). See agent.md §4 rule 5.
 */
export const TOGGLEABLE_FEATURES: PackageFeatureKey[] = [
  'website',
  'pwa',
  'admin_panel',
  'android_app',
  'ios_app',
];

export const GROWTH_ONLY_FEATURES: PackageFeatureKey[] = ['android_app', 'ios_app'];

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
