import type { UseCaseDeps } from '@/application/ports';
import type { AdminAccount, AdminUser, CreateAdminAccountInput } from '@/domain/entities';

export class DuplicateAccountEmailError extends Error {
  constructor(email: string) {
    super(`An account with the email ${email} already exists.`);
    this.name = 'DuplicateAccountEmailError';
  }
}

export function makeCreateAdminAccount(deps: UseCaseDeps) {
  return function createAdminAccount(
    input: CreateAdminAccountInput,
    actor: AdminUser,
  ): AdminAccount {
    const { accounts, activity, clock, ids } = deps;
    const email = input.email.trim().toLowerCase();

    if (accounts.findByEmail(email)) {
      throw new DuplicateAccountEmailError(email);
    }

    const account: AdminAccount = {
      id: ids.next('acct'),
      name: input.name.trim(),
      email,
      role: input.role,
      status: 'active',
      createdAt: clock.nowIso(),
    };

    accounts.save(account);
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
