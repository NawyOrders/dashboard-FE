import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser } from '@/domain/entities';

export function makeDeleteApplication(deps: UseCaseDeps) {
  return (tenantId: string, reason: string, actor: AdminUser): void => {
    const tenant = deps.restaurants.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');
    deps.activity.append({
      actor,
      action: 'support_access',
      target: {
        type: 'tenant',
        tenantId,
        label: `Delete application ${tenant.restaurantName} (${tenant.contact.email}) - ${reason}`,
      },
      previousValue: tenant.restaurantName,
      newValue: 'deleted',
    });
    const repo = deps.restaurants as unknown as {
      remove?: (id: string) => void;
      delete?: (id: string) => void;
      removeById?: (id: string) => void;
    };
    if (typeof repo.remove === 'function') repo.remove(tenantId);
    else if (typeof repo.delete === 'function') repo.delete(tenantId);
    else if (typeof repo.removeById === 'function') repo.removeById(tenantId);
  };
}
