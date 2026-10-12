import { useCurrentUser } from './useCurrentUser';
import type { Permission, Role } from '@/types';

/**
 * Single permission gate for the whole app. Actions are checked against the current role.
 * Roles (V1 mock): `super_admin` (full), `support` (read-only + logged tenant access).
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'restaurant.create',
    'restaurant.edit',
    'subscription.change',
    'feature.toggle',
    'broadcast.send',
    'activity.view',
    'settings.view',
    'support.access',
  ],
  support: ['activity.view', 'settings.view', 'support.access'],
};

export interface PermissionResult {
  allowed: boolean;
}

export function usePermission(action: Permission): PermissionResult {
  const { role } = useCurrentUser();
  return { allowed: ROLE_PERMISSIONS[role].includes(action) };
}
