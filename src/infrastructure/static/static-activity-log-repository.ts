import type { ActivityLogRepository, Clock, IdGenerator } from '@/application/ports';
import type { ActivityLog } from '@/domain/entities';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * STATIC activity log. New entries live in memory only; a refresh restores the seeded
 * `public/mock/activity-logs.json`.
 */
export class StaticActivityLogRepository implements ActivityLogRepository {
  private logs: ActivityLog[];

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    seed: ActivityLog[] = [],
  ) {
    this.logs = clone(seed);
  }

  findAll(): ActivityLog[] {
    return clone(this.logs);
  }

  append(entry: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const log: ActivityLog = {
      ...entry,
      id: this.ids.next('log'),
      timestamp: this.clock.nowIso(),
    };
    this.logs = [log, ...this.logs];
    return clone(log);
  }
}
