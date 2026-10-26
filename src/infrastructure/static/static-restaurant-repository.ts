import type { RestaurantRepository } from '@/application/ports';
import type { Tenant } from '@/domain/entities';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * STATIC restaurant store. The JSON files are loaded once; save/delete only update this
 * in-memory cache, so a page refresh restores the data from `public/mock/`.
 */
export class StaticRestaurantRepository implements RestaurantRepository {
  private tenants: Tenant[];

  constructor(seed: Tenant[] = []) {
    this.tenants = clone(seed);
  }

  findAll(): Tenant[] {
    return clone(this.tenants);
  }

  findById(tenantId: string): Tenant | null {
    const found = this.tenants.find((tenant) => tenant.id === tenantId);
    return found ? clone(found) : null;
  }

  save(tenant: Tenant): void {
    const index = this.tenants.findIndex((item) => item.id === tenant.id);
    if (index >= 0) this.tenants[index] = clone(tenant);
    else this.tenants.push(clone(tenant));
  }

  remove(tenantId: string): void {
    this.tenants = this.tenants.filter((tenant) => tenant.id !== tenantId);
  }
}
