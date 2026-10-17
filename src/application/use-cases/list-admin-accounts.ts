import type { UseCaseDeps } from '@/application/ports';
import type { AdminAccount } from '@/domain/entities';

export function makeListAdminAccounts(deps: UseCaseDeps) {
  return function listAdminAccounts(): AdminAccount[] {
    return deps.accounts
      .findAll()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  };
}
