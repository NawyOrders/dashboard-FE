import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, CreateAdminAccountInput, InternalAccount } from '@/domain/entities';
import { validatePassword } from '@/domain/rules/password';

export class DuplicateAccountEmailError extends Error {
  constructor(email: string) {
    super(`An account with the email ${email} already exists.`);
    this.name = 'DuplicateAccountEmailError';
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

export function makeCreateAdminAccount(deps: UseCaseDeps) {
  return async function createAdminAccount(
    input: CreateAdminAccountInput,
    actor: AdminUser,
  ): Promise<InternalAccount> {
    const { auth, activity, clock, ids } = deps;
    const email = input.email.trim().toLowerCase();

    if (await auth.findByEmail(email)) {
      throw new DuplicateAccountEmailError(email);
    }

    const policyError = validatePassword(input.password);
    if (policyError) {
      throw new InvalidPasswordError(policyError);
    }

    const account = await auth.createAccount({
      id: ids.next('acct'),
      name: input.name.trim(),
      email,
      accountType: 'internal',
      role: input.role,
      password: input.password,
      createdAt: clock.nowIso(),
    });

    activity.append({
      actor,
      action: 'account_created',
      target: { type: 'account', label: `${account.name} (${account.email})` },
      previousValue: null,
      newValue: `${account.email} — ${account.role}`,
    });
    return account;
  };
}
