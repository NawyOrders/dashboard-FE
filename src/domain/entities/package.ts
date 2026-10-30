export type PackageCode = 'start' | 'growth';

export type DurationMonths = 3 | 6 | 12;

export const DURATIONS: DurationMonths[] = [3, 6, 12];

export type PackageFeatureKey =
  | 'website'
  | 'pwa'
  | 'admin_panel'
  | 'android_app'
  | 'ios_app'
  | 'branches_up_to_2'
  | 'unlimited_orders'
  | 'no_commission'
  | 'ai';

export interface FeatureFlag {
  tenantId: string;
  key: PackageFeatureKey;
  enabled: boolean;
  updatedAt: string;
}
