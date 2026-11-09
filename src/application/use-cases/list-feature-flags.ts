import type { UseCaseDeps } from '@/application/ports';
import type { FeatureFlag } from '@/domain/entities';

export function makeListFeatureFlags(deps: UseCaseDeps) {
  return function listFeatureFlags(tenantId: string): FeatureFlag[] {
    if (!deps.restaurants.findById(tenantId)) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    return deps.flags.findByTenant(tenantId);
  };
}
