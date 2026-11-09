import type { SalesRepository } from '@/application/ports';
import type { SalesRecord } from '@/domain/entities';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Read-only STATIC sales store loaded from `public/mock/sales.json`. */
export class StaticSalesRepository implements SalesRepository {
  private records: SalesRecord[];

  constructor(seed: SalesRecord[] = []) {
    this.records = clone(seed);
  }

  findAll(): SalesRecord[] {
    return clone(this.records);
  }
}
