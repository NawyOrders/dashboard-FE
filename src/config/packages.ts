import type { PackageCode, PackageDefinition, PackageFeatureKey } from '@/domain/entities';
import { DURATIONS } from '@/domain/entities';

// OPEN: update restaurant-registration-fields.json subscription.billingCycle to match owner packages.
// The JSON still describes a monthly/yearly cycle; the owner's 3/6/12-month prices below are the
// source of truth and are not written back to that file.

// ASSUMPTION: EGP, owner to confirm.
export const PACKAGE_CURRENCY = 'EGP';

/** Durations offered for every package, in months. */
export const PACKAGE_DURATIONS = DURATIONS;

export const PACKAGE_FEATURE_LABELS: Record<PackageFeatureKey, string> = {
  website: 'Website',
  pwa: 'Progressive Web App (PWA)',
  admin_panel: 'Restaurant Admin Panel',
  android_app: 'Android App',
  ios_app: 'iOS App',
  branches_up_to_4: 'Branches (up to 2)',
  unlimited_orders: 'Unlimited orders',
  no_commission: 'No commission',
  ai: 'AI',
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

// Both packages include: website, PWA, restaurant admin panel, Android app, iOS app,
// up to 2 branches, unlimited orders, no commission.
// Growth additionally includes: AI. Start does not include AI.
const START_FEATURES: PackageFeatureKey[] = [
  'website',
  'pwa',
  'admin_panel',
  'android_app',
  'ios_app',
  'branches_up_to_4',
  'unlimited_orders',
  'no_commission',
];

const GROWTH_FEATURES: PackageFeatureKey[] = [...START_FEATURES, 'ai'];

const START_PRICES = { 3: 15000, 6: 32000, 12: 60000 };
const GROWTH_PRICES = { 3: 17000, 6: 34000, 12: 62000 };

export const PACKAGES: Record<PackageCode, PackageDefinition> = {
  start: {
    code: 'start',
    name: 'Start',
    tagline: 'Website, PWA and admin panel for up to 2 branches.',
    features: START_FEATURES,
    prices: START_PRICES,
    // NW-246: confirmed by the owner — a Start application may declare 1 to 2 branches.
    branchLimits: { min: 1, max: 2 },
  },
  growth: {
    code: 'growth',
    name: 'Growth',
    tagline: 'Everything in Start plus branded Android and iOS apps.',
    features: GROWTH_FEATURES,
    prices: GROWTH_PRICES,
    // NW-247: confirmed by the owner — the branch limit is 2 for EVERY package, so the
    // former Growth limit of 4 is gone. No extra-branch fee exists and none is shown.
    branchLimits: { min: 1, max: 2 },
  },
};

export const PACKAGE_LIST: PackageDefinition[] = [PACKAGES.start, PACKAGES.growth];
