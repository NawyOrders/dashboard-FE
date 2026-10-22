import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser } from '@/domain/entities';
import { validatePassword } from '@/domain/rules/password';
import { tenantRoleLabel } from '@/config/restaurant-roles';

export class UnknownTenantAccountError extends Error {
  constructor(accountId: string) {
    super(`Tenant account not found: ${accountId}`);
    this.name = 'UnknownTenantAccountError';
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

export interface ResetTenantAccountPasswordInput {
  accountId: string;
  newPassword: string;
}

/**
 * NW-247: a Super Admin resets the password of a tenant account. The old password stops
 * working immediately. The activity log records the reset — without the password value.
 */
export function makeResetTenantAccountPassword(deps: UseCaseDeps) {
  return async function resetTenantAccountPassword(
    input: ResetTenantAccountPasswordInput,
    actor: AdminUser,
  ): Promise<void> {
    const { auth, activity } = deps;

    const account = await auth.findById(input.accountId);
    if (!account || account.accountType !== 'tenant') {
      throw new UnknownTenantAccountError(input.accountId);
    }

    const policyError = validatePassword(input.newPassword);
    if (policyError) {
      throw new InvalidPasswordError(policyError);
    }

    await auth.updatePassword(account.id, input.newPassword);

    activity.append({
      actor,
      action: 'account.password_reset',
      target: {
        type: 'account',
        tenantId: account.tenantId,
        label: `${account.email} — ${tenantRoleLabel(account.restaurantRole)}`,
      },
      previousValue: null,
      newValue: 'Password reset',
    });
  };
}
