import type { Permission, Role } from '@/domain/entities';

/**
 * Single source of truth for role → permission mapping (agent.md §4 rule 12).
 * The registry also carries display metadata used by the Accounts & Roles page.
 */
export interface RoleDefinition {
  label: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_REGISTRY: Record<Role, RoleDefinition> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full platform access, including account and role management.',
    permissions: [
      'restaurant.create',
      'restaurant.edit',
      'subscription.change',
      'feature.toggle',
      'broadcast.send',
      'activity.view',
      'analytics.view',
      'settings.view',
      'support.access',
      'accounts.view',
      'account.create',
      'role.manage',
      'tenantAccount.create',
      'tenantAccount.resetPassword',
    ],
  },
  support: {
    label: 'Support',
    description: 'Read-only dashboard access with logged tenant lookups.',
    permissions: [
      'activity.view',
      'analytics.view',
      'settings.view',
      'support.access',
      'accounts.view',
      'tenantAccount.create',
      'tenantAccount.resetPassword',
    ],
  },
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ROLE_REGISTRY.super_admin.permissions,
  support: ROLE_REGISTRY.support.permissions,
};

export function isAllowed(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
