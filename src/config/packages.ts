import type { DurationMonths, PackageCode, PackageDefinition, PackageFeatureKey } from '@/types';

export const PACKAGE_FEATURE_LABELS: Record<PackageFeatureKey, string> = {
  website: 'Website',
  pwa: 'Progressive Web App (PWA)',
  admin_panel: 'Restaurant Admin Panel',
  android_app: 'Android App',
  ios_app: 'iOS App',
  branches_up_to_4: 'Branches (up to 4)',
  unlimited_orders: 'Unlimited orders',
  no_commission: 'No commission',
};

export const PACKAGE_FEATURE_ORDER: PackageFeatureKey[] = [
  'website',
  'pwa',
  'admin_panel',
  'android_app',
  'ios_app',
  'branches_up_to_4',
  'unlimited_orders',
  'no_commission',
];

const START_FEATURES: PackageFeatureKey[] = [
  'website',
  'pwa',
  'admin_panel',
  'branches_up_to_4',
  'unlimited_orders',
  'no_commission',
];

const GROWTH_FEATURES: PackageFeatureKey[] = [...START_FEATURES, 'android_app', 'ios_app'];

export const PACKAGES: Record<PackageCode, PackageDefinition> = {
  start: {
    code: 'start',
    name: 'Start',
    tagline: 'Website, PWA and admin panel for up to 4 branches.',
    features: START_FEATURES,
    prices: { 3: 9000, 6: 17000, 12: 32000 },
  },
  growth: {
    code: 'growth',
    name: 'Growth',
    tagline: 'Everything in Start plus branded Android and iOS apps.',
    features: GROWTH_FEATURES,
    prices: { 3: 18000, 6: 34000, 12: 64000 },
  },
};

export const PACKAGE_LIST: PackageDefinition[] = [PACKAGES.start, PACKAGES.growth];

export function packageHasFeature(code: PackageCode, feature: PackageFeatureKey): boolean {
  return PACKAGES[code].features.includes(feature);
}

export function getReferencePrice(code: PackageCode, duration: DurationMonths): number {
  return PACKAGES[code].prices[duration];
}
