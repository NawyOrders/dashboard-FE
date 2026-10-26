import type { UseCaseDeps } from '@/application/ports';
import type { Account, InternalAccount } from '@/domain/entities';

function isInternal(account: Account): account is InternalAccount {
  return account.accountType === 'internal';
}

export function makeListAdminAccounts(deps: UseCaseDeps) {
  return async function listAdminAccounts(): Promise<InternalAccount[]> {
    const accounts = await deps.auth.findAll();
    return accounts
      .filter(isInternal)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  };
}
