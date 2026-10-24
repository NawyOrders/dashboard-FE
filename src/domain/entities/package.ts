export type PackageCode = 'start' | 'growth';

export type DurationMonths = 3 | 6 | 12;

export const DURATIONS: DurationMonths[] = [3, 6, 12];

export type PackageFeatureKey =
  | 'website'
  | 'pwa'
  | 'admin_panel'
  | 'android_app'
  | 'ios_app'
  | 'branches_up_to_4'
  | 'unlimited_orders'
  | 'no_commission';

export interface PackageDefinition {
  code: PackageCode;
  name: string;
  tagline: string;
  features: PackageFeatureKey[];
  /** Reference prices in EGP. Not final commercial terms. */
  prices: Record<DurationMonths, number>;
  /**
   * Branch count a restaurant application may declare per package (NW-246, confirmed
   * by the owner; NW-247 sets the same limit of 2 for every package). The platform-wide
   * included-branch count (`INCLUDED_BRANCHES` in `config/policy.ts`) is derived from
   * these limits, so the two can never disagree.
   */
  branchLimits: { min: number; max: number };
}

export interface FeatureFlag {
  tenantId: string;
  key: PackageFeatureKey;
  enabled: boolean;
  updatedAt: string;
}
