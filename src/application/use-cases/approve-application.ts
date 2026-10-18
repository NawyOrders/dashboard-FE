import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, Tenant } from '@/domain/entities';

export class ApplicationNotPendingError extends Error {
  constructor(tenantId: string) {
    super(`Tenant is not pending approval: ${tenantId}`);
    this.name = 'ApplicationNotPendingError';
  }
}

/**
 * Approve a pending restaurant application: the tenant moves `pending_approval` →
 * `approved` and the decision is written to the activity log. ASSUMPTION: approving
 * does not auto-activate the subscription — an admin still manages it from the
 * restaurant details page.
 */
export function makeApproveApplication(deps: UseCaseDeps) {
  return function approveApplication(tenantId: string, actor: AdminUser): Tenant {
    const { restaurants, activity } = deps;
    const tenant = restaurants.findById(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);
    if (tenant.status !== 'pending_approval') throw new ApplicationNotPendingError(tenantId);

    const next: Tenant = { ...tenant, status: 'approved' };
    restaurants.save(next);

    activity.append({
      actor,
      action: 'application_approved',
      target: { type: 'tenant', tenantId, label: tenant.restaurantName },
      previousValue: 'Pending approval',
      newValue: 'Approved',
    });

    return next;
  };
}
