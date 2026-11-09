import type { RestaurantRepository } from '@/application/ports';
import type { Tenant } from '@/domain/entities';
import { isListed } from '@/domain/rules/tenants';

/**
 * Tenants awaiting approval (`pending_approval`), newest first. These are excluded
 * from the directory/Overview (`isListed`) and reviewed on the Applications page.
 */
export function makeListApplications(restaurants: RestaurantRepository) {
  return function listApplications(): Tenant[] {
    return restaurants
      .findAll()
      .filter((tenant) => !isListed(tenant))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  };
}
