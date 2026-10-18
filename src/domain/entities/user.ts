export type Role = 'super_admin' | 'support';

export type Permission =
  | 'restaurant.create'
  | 'restaurant.edit'
  | 'subscription.change'
  | 'feature.toggle'
  | 'broadcast.send'
  | 'activity.view'
  | 'analytics.view'
  | 'settings.view'
  | 'support.access'
  | 'accounts.view'
  | 'account.create'
  | 'role.manage';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}
