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
   * by the owner). This is the registration-form limit and is independent from the
   * platform-wide included-branch count (`INCLUDED_BRANCHES` in `config/policy.ts`).
   */
  branchLimits: { min: number; max: number };
}

export interface FeatureFlag {
  tenantId: string;
  key: PackageFeatureKey;
  enabled: boolean;
  updatedAt: string;
}
