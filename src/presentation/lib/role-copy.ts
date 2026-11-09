import type { Role, TenantRole } from '@/domain/entities';
import { en } from '@/presentation/i18n/en';

export function roleLabel(role: Role): string {
  return role === 'super_admin' ? en.roles.superAdmin : en.roles.support;
}

export function roleDescription(role: Role): string {
  return role === 'super_admin' ? en.roles.superAdminDescription : en.roles.supportDescription;
}

export function tenantRoleLabel(role: TenantRole): string {
  const labels = en.restaurantRoles as Record<string, string>;
  return labels[role] ?? role;
}
