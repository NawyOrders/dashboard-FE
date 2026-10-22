import type { PackageCode, PackageDefinition, PackageFeatureKey } from '@/domain/entities';

export const PACKAGE_FEATURE_LABELS: Record<PackageFeatureKey, string> = {
  website: 'Website',
  pwa: 'Progressive Web App (PWA)',
  admin_panel: 'Restaurant Admin Panel',
  android_app: 'Android App',
  ios_app: 'iOS App',
  branches_up_to_4: 'Branches (up to 2)',
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

const START_PRICES = { 3: 9000, 6: 17000, 12: 32000 };
const GROWTH_PRICES = { 3: 18000, 6: 34000, 12: 64000 };

export const PACKAGES: Record<PackageCode, PackageDefinition> = {
  start: {
    code: 'start',
    name: 'Start',
    tagline: 'Website, PWA and admin panel for up to 2 branches.',
    features: START_FEATURES,
    prices: START_PRICES,
    // NW-246: the monthly price is the 3-month price divided by 3, the yearly price is
    // the 12-month price.
    billingPrices: { monthly: START_PRICES[3] / 3, yearly: START_PRICES[12] },
    // NW-246: confirmed by the owner — a Start application may declare 1 to 2 branches.
    branchLimits: { min: 1, max: 2 },
  },
  growth: {
    code: 'growth',
    name: 'Growth',
    tagline: 'Everything in Start plus branded Android and iOS apps.',
    features: GROWTH_FEATURES,
    prices: GROWTH_PRICES,
    billingPrices: { monthly: GROWTH_PRICES[3] / 3, yearly: GROWTH_PRICES[12] },
    // NW-247: confirmed by the owner — the branch limit is 2 for EVERY package, so the
    // former Growth limit of 4 is gone. No extra-branch fee exists and none is shown.
    branchLimits: { min: 1, max: 2 },
  },
};

export const PACKAGE_LIST: PackageDefinition[] = [PACKAGES.start, PACKAGES.growth];
