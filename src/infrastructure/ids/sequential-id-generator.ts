import type { IdGenerator } from '@/application/ports';

/**
 * Deterministic ids: `${prefix}_${start + counter}`. The `start` offset keeps generated
 * ids from colliding with seeded ids (which use small numbers). Tests can pass `start = 0`.
 */
export function createSequentialIdGenerator(start = 0): IdGenerator {
  let counter = start;
  return {
    next(prefix: string): string {
      counter += 1;
      return `${prefix}_${counter}`;
    },
  };
}
