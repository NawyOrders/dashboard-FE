import type { SalesRepository } from '@/application/ports';
import type { SalesRecord } from '@/domain/entities';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Read-only in-memory store; returns deep copies so callers cannot mutate state. */
export class InMemorySalesRepository implements SalesRepository {
  private records: SalesRecord[];

  constructor(seed: SalesRecord[] = []) {
    this.records = clone(seed);
  }

  findAll(): SalesRecord[] {
    return clone(this.records);
  }
}
