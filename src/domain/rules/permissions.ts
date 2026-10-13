import type { Permission, Role } from '@/domain/entities';

/**
 * Single source of truth for role → permission mapping (agent.md §4 rule 12).
 * Roles for V1 mock: `super_admin` (full), `support` (read-only + logged tenant access).
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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

export function isAllowed(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
