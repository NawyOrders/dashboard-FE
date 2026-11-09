import { useCurrentUser } from './useCurrentUser';
import { isAllowed } from '@/domain/rules/permissions';
import type { Permission } from '@/domain/entities';

export interface PermissionResult {
  allowed: boolean;
}

/**
 * Single permission gate for the whole app. Delegates the role → permission mapping
 * to the domain (`domain/rules/permissions.ts`).
 */
export function usePermission(action: Permission): PermissionResult {
  const { role } = useCurrentUser();
  return { allowed: isAllowed(role, action) };
}
