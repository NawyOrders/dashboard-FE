import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, Tenant } from '@/domain/entities';
import { validatePassword } from '@/domain/rules/password';
import { resolveSubscriptionStart, todayInCairo } from '@/domain/rules/subscription';

export class ApplicationNotPendingError extends Error {
  constructor(tenantId: string) {
    super(`Tenant is not pending approval: ${tenantId}`);
    this.name = 'ApplicationNotPendingError';
  }
}

export class InvalidAdminPasswordError extends Error {
  constructor() {
    super('The restaurant admin password does not satisfy the password policy.');
    this.name = 'InvalidAdminPasswordError';
  }
}

export class InvalidSubscriptionStartDateError extends Error {
  constructor() {
    super('The subscription start date is missing, invalid or in the past.');
    this.name = 'InvalidSubscriptionStartDateError';
  }
}

/**
 * Approve a pending restaurant application: the tenant moves `pending_approval` →
 * `approved` and the decision is written to the activity log. ASSUMPTION: approving
 * does not auto-activate the subscription — an admin still manages it from the
 * restaurant details page.
 *
 * NW-247: approving also creates the admin account of the restaurant with the given
 * password. The password itself is never written to the activity log.
 */
export function makeApproveApplication(deps: UseCaseDeps) {
  return async function approveApplication(
    tenantId: string,
    adminPassword: string,
    actor: AdminUser,
    subscriptionStartDate: string,
  ): Promise<Tenant> {
    const { restaurants, activity, auth, clock, ids } = deps;
    const tenant = restaurants.findById(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);
    if (tenant.status !== 'pending_approval') throw new ApplicationNotPendingError(tenantId);
    if (validatePassword(adminPassword)) throw new InvalidAdminPasswordError();

    const start = resolveSubscriptionStart(
      subscriptionStartDate,
      tenant.subscription.durationMonths,
      todayInCairo(new Date(clock.nowIso())),
    );
    if (!start.ok) throw new InvalidSubscriptionStartDateError();

    const next: Tenant = {
      ...tenant,
      status: 'approved',
      subscription: {
        ...tenant.subscription,
        startDate: subscriptionStartDate.trim(),
        endDate: start.endDate,
        updatedAt: clock.nowIso(),
      },
    };
    restaurants.save(next);

    const account = await auth.createAccount({
      id: ids.next('acct'),
      name: tenant.contact.name?.trim() || tenant.restaurantName,
      email: tenant.contact.email.trim().toLowerCase(),
      accountType: 'tenant',
      tenantId: tenant.id,
      restaurantRole: 'admin',
      password: adminPassword,
      createdAt: clock.nowIso(),
    });

    activity.append({
      actor,
      action: 'application_approved',
      target: { type: 'tenant', tenantId, label: tenant.restaurantName },
      previousValue: 'Pending approval',
      newValue: 'Approved',
    });

    activity.append({
      actor,
      action: 'account_created',
      target: { type: 'account', tenantId, label: `${account.name} (${account.email})` },
      previousValue: null,
      newValue: `${account.email} — admin`,
    });

    return next;
  };
}
