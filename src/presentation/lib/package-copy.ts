import { PACKAGE_NAMES } from '@/domain/rules/packages';
import type { PackageCode, PackageFeatureKey } from '@/domain/entities';
import { en } from '@/presentation/i18n/en';

/** Package names are brand terms and stay as they are in both languages. */
export function packageName(code: PackageCode | null): string {
  return code ? PACKAGE_NAMES[code] : en.common.notAvailable;
}

export function packageTagline(code: PackageCode): string {
  return en.packageTaglines[code];
}

export function packageFeatureLabel(feature: PackageFeatureKey): string {
  return en.packageFeatures[feature];
}
