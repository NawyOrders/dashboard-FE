import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, FeatureFlag, PackageFeatureKey } from '@/domain/entities';
import { PACKAGES } from '@/config/packages';
import { canEnableFeature } from '@/domain/rules/packages';

export function makeSetFeatureFlag(deps: UseCaseDeps) {
  return function setFeatureFlag(
    tenantId: string,
    key: PackageFeatureKey,
    enabled: boolean,
    actor: AdminUser,
  ): FeatureFlag {
    const { restaurants, flags, activity, clock } = deps;
    const tenant = restaurants.findById(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    if (!canEnableFeature(tenant.subscription.packageCode, key, enabled)) {
      throw new Error(
        `Feature "${key}" is not available on the ${PACKAGES[tenant.subscription.packageCode].name} package`,
      );
    }

    const existing = flags.findByTenant(tenantId).find((flag) => flag.key === key);
    const previous = existing?.enabled ?? false;
    const next: FeatureFlag = {
      tenantId,
      key,
      enabled,
      updatedAt: clock.nowIso(),
    };
    flags.save(next);

    activity.append({
      actor,
      action: 'feature_toggled',
      target: { type: 'feature', tenantId, label: `${tenant.restaurantName} — ${key}` },
      previousValue: previous ? 'Enabled' : 'Disabled',
      newValue: enabled ? 'Enabled' : 'Disabled',
    });
    return next;
  };
}
