import type { ListTenantsParams, TenantSort } from '@/application/dto';
import type { RestaurantRepository } from '@/application/ports';
import type { Tenant } from '@/domain/entities';
import { isExpiringSoon } from '@/domain/rules/subscription';

/**
 * Normalise a search query: trim, then match case-insensitively against business name,
 * restaurant name and Tenant ID. Uses `String.includes` (never a RegExp), so punctuation
 * such as `'`, `&` and `-` in the query matches literally. (BUG-022, BUG-023)
 */
export function matchesSearch(tenant: Tenant, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    tenant.restaurantName.toLowerCase().includes(needle) ||
    tenant.businessName.toLowerCase().includes(needle) ||
    tenant.tenantId.toLowerCase().includes(needle)
  );
}

const SORTERS: Record<TenantSort, (a: Tenant, b: Tenant) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  name_asc: (a, b) => a.restaurantName.localeCompare(b.restaurantName),
  expiry_asc: (a, b) => a.subscription.endDate.localeCompare(b.subscription.endDate),
};

export function applyTenantQuery(tenants: Tenant[], params: ListTenantsParams = {}): Tenant[] {
  let result = tenants;

  if (params.search && params.search.trim()) {
    result = result.filter((tenant) => matchesSearch(tenant, params.search!));
  }
  if (params.packageCode) {
    result = result.filter((t) => t.subscription.packageCode === params.packageCode);
  }
  if (params.restaurantStatus) {
    result = result.filter((t) => t.status === params.restaurantStatus);
  }
  if (params.subscriptionStatus) {
    result = result.filter((t) => t.subscription.status === params.subscriptionStatus);
  }
  if (params.growthOnly) {
    result = result.filter((t) => t.subscription.packageCode === 'growth');
  }
  if (params.expiringSoon) {
    result = result.filter((t) => isExpiringSoon(t.subscription));
  }

  const sorter = SORTERS[params.sort ?? 'newest'];
  return [...result].sort(sorter);
}

export function makeListTenants(restaurants: RestaurantRepository) {
  return function listTenants(params: ListTenantsParams = {}): Tenant[] {
    return applyTenantQuery(restaurants.findAll(), params);
  };
}
