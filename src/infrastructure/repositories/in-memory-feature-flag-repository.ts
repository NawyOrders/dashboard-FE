import type { FeatureFlagRepository } from '@/application/ports';
import type { FeatureFlag, Tenant } from '@/domain/entities';
import { TOGGLEABLE_FEATURES, packageHasFeature } from '@/domain/rules/packages';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class InMemoryFeatureFlagRepository implements FeatureFlagRepository {
  private flags = new Map<string, FeatureFlag[]>();

  findByTenant(tenantId: string): FeatureFlag[] {
    return clone(this.flags.get(tenantId) ?? []);
  }

  save(flag: FeatureFlag): void {
    const list = this.flags.get(flag.tenantId) ?? [];
    const index = list.findIndex((existing) => existing.key === flag.key);
    if (index >= 0) list[index] = clone(flag);
    else list.push(clone(flag));
    this.flags.set(flag.tenantId, list);
  }

  /** Flags default to the tenant's package entitlement. */
  seedDefaults(tenant: Tenant): void {
    const list: FeatureFlag[] = TOGGLEABLE_FEATURES.map((key) => ({
      tenantId: tenant.id,
      key,
      enabled: packageHasFeature(tenant.subscription.packageCode, key),
      updatedAt: tenant.subscription.updatedAt,
    }));
    this.flags.set(tenant.id, list);
  }
}
