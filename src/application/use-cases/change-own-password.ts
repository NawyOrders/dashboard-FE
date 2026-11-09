import type { ChangeOwnPasswordInput } from '@/application/dto';
import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser } from '@/domain/entities';
import { validatePassword } from '@/domain/rules/password';

export class WrongCurrentPasswordError extends Error {
  constructor() {
    super('The current password is not correct.');
    this.name = 'WrongCurrentPasswordError';
  }
}

export class PasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordPolicyError';
  }
}

/**
 * NW-247: a dashboard user changes their own password. The current password is checked
 * first; a wrong one changes nothing. The activity log records the change without the
 * password value.
 */
export function makeChangeOwnPassword(deps: UseCaseDeps) {
  return async function changeOwnPassword(
    input: ChangeOwnPasswordInput,
    actor: AdminUser,
  ): Promise<void> {
    const { auth, activity } = deps;

    const account = await auth.findByCredentials(actor.email, input.currentPassword);
    if (!account) {
      // The same answer as for an unknown email: the store never says which part failed.
      throw new WrongCurrentPasswordError();
    }

    const policyError = validatePassword(input.newPassword);
    if (policyError) {
      throw new PasswordPolicyError(policyError);
    }

    await auth.updatePassword(account.id, input.newPassword);

    activity.append({
      actor,
      action: 'account.password_changed',
      target: { type: 'account', label: `${account.name} (${account.email})` },
      previousValue: null,
      newValue: 'Password changed',
    });
  };
}
