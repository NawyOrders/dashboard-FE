import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, RestaurantStatus, Tenant } from '@/domain/entities';

export function makeUpdateRestaurantStatus(deps: UseCaseDeps) {
  return function updateRestaurantStatus(
    tenantId: string,
    status: RestaurantStatus,
    actor: AdminUser,
  ): Tenant {
    const { restaurants, activity } = deps;
    const tenant = restaurants.findById(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const previous = tenant.status;
    const next: Tenant = { ...tenant, status };
    restaurants.save(next);

    if (previous !== status) {
      activity.append({
        actor,
        action: 'restaurant_status_changed',
        target: { type: 'tenant', tenantId, label: tenant.restaurantName },
        previousValue: previous,
        newValue: status,
      });
    }
    return next;
  };
}
