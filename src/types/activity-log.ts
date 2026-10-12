import type { Role } from './user';

export type ActivityAction =
  | 'restaurant_created'
  | 'package_changed'
  | 'duration_changed'
  | 'subscription_dates_changed'
  | 'restaurant_status_changed'
  | 'subscription_status_changed'
  | 'feature_toggled'
  | 'branch_added'
  | 'support_access';

export interface Actor {
  id: string;
  name: string;
  role: Role;
}

export interface ActivityTarget {
  type: 'tenant' | 'subscription' | 'feature' | 'branch';
  tenantId: string;
  label: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: Actor;
  action: ActivityAction;
  target: ActivityTarget;
  previousValue: string | null;
  newValue: string | null;
}
