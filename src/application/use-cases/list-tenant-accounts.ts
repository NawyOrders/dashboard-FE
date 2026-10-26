import type { TenantAccountView } from '@/application/dto';
import type { UseCaseDeps } from '@/application/ports';
import type { Account, TenantAccount } from '@/domain/entities';

function isTenant(account: Account): account is TenantAccount {
  return account.accountType === 'tenant';
}

/**
 * NW-247: the tenant accounts of every restaurant, with the name of the restaurant
 * they belong to.
 */
export function makeListTenantAccounts(deps: UseCaseDeps) {
  return async function listTenantAccounts(): Promise<TenantAccountView[]> {
    const accounts = await deps.auth.findAll();
    return accounts
      .filter(isTenant)
      .map((account) => ({
        id: account.id,
        email: account.email,
        name: account.name,
        tenantId: account.tenantId,
        restaurantName:
          deps.restaurants.findById(account.tenantId)?.restaurantName ?? account.tenantId,
        restaurantRole: account.restaurantRole,
        createdAt: account.createdAt,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  };
}
