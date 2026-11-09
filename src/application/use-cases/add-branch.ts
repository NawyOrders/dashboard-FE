import type { AddBranchInput } from '@/application/dto';
import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, Branch } from '@/domain/entities';

export function makeAddBranch(deps: UseCaseDeps) {
  return function addBranch(tenantId: string, input: AddBranchInput, actor: AdminUser): Branch {
    const { restaurants, activity, ids } = deps;
    const tenant = restaurants.findById(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const branch: Branch = { ...input, id: ids.next('b'), tenantId };
    restaurants.save({ ...tenant, branches: [...tenant.branches, branch] });

    activity.append({
      actor,
      action: 'branch_added',
      target: { type: 'branch', tenantId, label: `${tenant.restaurantName} — ${branch.name}` },
      previousValue: null,
      newValue: branch.name,
    });
    return branch;
  };
}
