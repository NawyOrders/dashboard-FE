import type { RevenueRepository } from '@/application/ports';
import type { RevenueRecord } from '@/domain/entities';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Read-only in-memory store; returns deep copies so callers cannot mutate state. */
export class InMemoryRevenueRepository implements RevenueRepository {
  private records: RevenueRecord[];

  constructor(seed: RevenueRecord[] = []) {
    this.records = clone(seed);
  }

  findAll(): RevenueRecord[] {
    return clone(this.records);
  }
}
