import type { RestaurantRepository } from '@/application/ports';
import type { Tenant } from '@/domain/entities';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** In-memory store. Always returns/stores deep copies so callers cannot mutate state. */
export class InMemoryRestaurantRepository implements RestaurantRepository {
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
    const index = this.tenants.findIndex((t) => t.id === tenant.id);
    if (index >= 0) this.tenants[index] = clone(tenant);
    else this.tenants.push(clone(tenant));
  }

  delete(tenantId: string): void {
    this.tenants = this.tenants.filter((t) => t.id !== tenantId);
  }

  removeById(tenantId: string): void {
    this.delete(tenantId);
  }

  remove(tenantId: string): void {
    this.delete(tenantId);
  }
}
