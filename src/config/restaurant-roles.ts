import type { RestaurantRole } from '@/domain/entities';

// MOCK: replace with owner-defined roles.
// `admin` is intentionally NOT in this list. It is created automatically on application approval.
export const RESTAURANT_ROLES = [
  { id: 'cashier', label: 'Cashier' },
  { id: 'waiter', label: 'Waiter' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'manager', label: 'Manager' },
] as const satisfies ReadonlyArray<{ id: RestaurantRole; label: string }>;

export type RestaurantRoleId = (typeof RESTAURANT_ROLES)[number]['id'];

/** The roles a tenant account can be given from the dashboard. `admin` is never one. */
export const SELECTABLE_RESTAURANT_ROLE_IDS = RESTAURANT_ROLES.map(
  (role) => role.id,
) as RestaurantRoleId[];

export function restaurantRoleLabel(roleId: RestaurantRole): string {
  return RESTAURANT_ROLES.find((role) => role.id === roleId)?.label ?? roleId;
}
