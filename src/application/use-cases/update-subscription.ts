import type { UpdateSubscriptionInput } from '@/application/dto';
import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, Tenant } from '@/domain/entities';
import { PACKAGE_NAMES, packageHasFeature } from '@/domain/rules/packages';

/**
 * Updates the subscription and writes one ActivityLog per changed aspect
 * (package / duration / status / dates). Downgrading from Growth revokes features
 * the new package does not entitle. (agent.md §4 rules 6–8)
 */
export function makeUpdateSubscription(deps: UseCaseDeps) {
  return function updateSubscription(
    tenantId: string,
    input: UpdateSubscriptionInput,
    actor: AdminUser,
  ): Tenant {
    const { restaurants, activity, flags, clock } = deps;
    const tenant = restaurants.findById(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const prev = tenant.subscription;
    const now = clock.nowIso();
    const label = `${tenant.restaurantName} — subscription`;

    if (prev.packageCode !== input.packageCode) {
      activity.append({
        actor,
        action: 'package_changed',
        target: { type: 'subscription', tenantId, label },
        previousValue: PACKAGE_NAMES[prev.packageCode],
        newValue: PACKAGE_NAMES[input.packageCode],
      });
    }
    if (prev.durationMonths !== input.durationMonths) {
      activity.append({
        actor,
        action: 'duration_changed',
        target: { type: 'subscription', tenantId, label },
        previousValue: `${prev.durationMonths} months`,
        newValue: `${input.durationMonths} months`,
      });
    }
    if (prev.status !== input.status) {
      activity.append({
        actor,
        action: 'subscription_status_changed',
        target: { type: 'subscription', tenantId, label },
        previousValue: prev.status,
        newValue: input.status,
      });
    }
    if (prev.startDate !== input.startDate || prev.endDate !== input.endDate) {
      activity.append({
        actor,
        action: 'subscription_dates_changed',
        target: { type: 'subscription', tenantId, label },
        previousValue: `${prev.startDate} → ${prev.endDate}`,
        newValue: `${input.startDate} → ${input.endDate}`,
      });
    }

    const next: Tenant = {
      ...tenant,
      subscription: { ...prev, ...input, updatedAt: now },
    };
    restaurants.save(next);

    // Downgrade: revoke features the new package does not include.
    if (prev.packageCode !== input.packageCode) {
      for (const flag of flags.findByTenant(tenantId)) {
        if (flag.enabled && !packageHasFeature(input.packageCode, flag.key)) {
          flags.save({ ...flag, enabled: false, updatedAt: now });
        }
      }
    }

    return next;
  };
}
