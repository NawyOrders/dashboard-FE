import { PACKAGE_FEATURE_LABELS, PACKAGES } from '@/config/packages';
import type { PackageCode, PackageFeatureKey } from '@/domain/entities';
import { en } from '@/presentation/i18n/en';

/** Package names are brand terms and stay as they are in both languages. */
export function packageName(code: PackageCode): string {
  return PACKAGES[code].name;
}

export function packageTagline(code: PackageCode): string {
  const taglines = en.packageTaglines as Record<string, string>;
  return taglines[code] ?? PACKAGES[code].tagline;
}

export function packageFeatureLabel(feature: PackageFeatureKey): string {
  const labels = en.packageFeatures as Record<string, string>;
  return labels[feature] ?? PACKAGE_FEATURE_LABELS[feature];
}
