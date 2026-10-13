import type { UseCaseDeps } from '@/application/ports';
import type { Tenant } from '@/domain/entities';

export function makeGetTenant(restaurants: UseCaseDeps['restaurants']) {
  return function getTenant(tenantId: string): Tenant {
    const tenant = restaurants.findById(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);
    return tenant;
  };
}
