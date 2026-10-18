import type { DurationMonths, PackageCode } from './package';

/**
 * Separate, non-mergeable status domains.
 * Restaurant Status, Subscription Status, Website/PWA status and Mobile App status
 * must never be collapsed into a single field or badge.
 */
export type RestaurantStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'pending_approval'
  | 'approved';

export type BranchStatus = 'active' | 'pending' | 'inactive';

export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired' | 'not_started';

/** Website and PWA delivery status. `null` renders as "Not tracked". */
export type ChannelStatus = 'ready' | 'in_setup' | 'not_tracked';

/**
 * App delivery status. Entitlement (package = Growth) is NOT the same as delivery.
 * A tenant may be entitled while the app state is still not_started.
 */
export type AppStatus = 'not_started' | 'in_preparation' | 'submitted_to_store' | 'published';

export interface Subscription {
  id: string;
  tenantId: string;
  packageCode: PackageCode;
  durationMonths: DurationMonths;
  status: SubscriptionStatus;
  /** ISO date string (yyyy-mm-dd). Chosen manually — no automatic rule. */
  startDate: string;
  /** ISO date string (yyyy-mm-dd). */
  endDate: string;
  updatedAt: string;
}
