import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, Tenant } from '@/domain/entities';

export function makeUpdateApplication(deps: UseCaseDeps) {
  return (tenantId: string, patch: Partial<Tenant>, actor: AdminUser): Tenant => {
    const tenant = deps.restaurants.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');
    const before = JSON.parse(JSON.stringify(tenant)) as Tenant;
    const updated: Tenant = { ...tenant, ...(patch as Partial<Tenant>) } as Tenant;
    deps.restaurants.save(updated);
    const changes: Array<{ field: string; previous: unknown; next: unknown }> = [];
    const keys = Object.keys(patch || {}) as Array<string>;
    for (const key of keys) {
      const beforeVal = (before as unknown as Record<string, unknown>)[key];
      const updatedVal = (updated as unknown as Record<string, unknown>)[key];
      if (JSON.stringify(beforeVal) !== JSON.stringify(updatedVal)) {
        changes.push({ field: key, previous: beforeVal, next: updatedVal });
      }
    }
    for (const c of changes) {
      deps.activity.append({
        actor,
        action: 'restaurant_status_changed',
        target: {
          type: 'tenant',
          tenantId,
          label: `${c.field}: ${String(c.previous)} → ${String(c.next)}`,
        },
        previousValue: c.previous == null ? null : String(c.previous),
        newValue: c.next == null ? null : String(c.next),
      });
    }
    if (changes.length === 0) {
      deps.activity.append({
        actor,
        action: 'restaurant_status_changed',
        target: {
          type: 'tenant',
          tenantId,
          label: 'Application updated',
        },
        previousValue: null,
        newValue: null,
      });
    }
    return updated;
  };
}
