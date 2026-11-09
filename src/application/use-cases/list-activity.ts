import type { ListActivityParams } from '@/application/dto';
import type { UseCaseDeps } from '@/application/ports';
import type { ActivityLog } from '@/domain/entities';

export function makeListActivity(deps: UseCaseDeps) {
  return function listActivity(params: ListActivityParams = {}): ActivityLog[] {
    let result = deps.activity.findAll();
    if (params.tenantId) {
      result = result.filter((log) => log.target.tenantId === params.tenantId);
    }
    if (params.action) {
      result = result.filter((log) => log.action === params.action);
    }
    if (params.from) {
      result = result.filter((log) => log.timestamp.slice(0, 10) >= params.from!);
    }
    if (params.to) {
      result = result.filter((log) => log.timestamp.slice(0, 10) <= params.to!);
    }
    return [...result].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  };
}
