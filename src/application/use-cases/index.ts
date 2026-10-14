import type {
  AddBranchInput,
  ListActivityParams,
  ListTenantsParams,
  OverviewAnalysis,
  UpdateSubscriptionInput,
} from '@/application/dto';
import type { CurrentUserProvider, UseCaseDeps } from '@/application/ports';
import type {
  ActivityLog,
  AdminUser,
  Branch,
  CreateTenantInput,
  FeatureFlag,
  PackageDefinition,
  PackageFeatureKey,
  RestaurantStatus,
  Tenant,
} from '@/domain/entities';
import { makeListTenants } from './list-tenants';
import { makeGetTenant } from './get-tenant';
import { makeCreateRestaurant } from './create-restaurant';
import { makeUpdateSubscription } from './update-subscription';
import { makeUpdateRestaurantStatus } from './update-restaurant-status';
import { makeSetFeatureFlag } from './set-feature-flag';
import { makeListFeatureFlags } from './list-feature-flags';
import { makeAddBranch } from './add-branch';
import { makeListActivity } from './list-activity';
import { makeListPackages } from './list-packages';
import { makeGetCurrentUser } from './get-current-user';
import { makeGetOverviewAnalysis } from './get-overview-analysis';

/** Synchronous, framework-free core. The infrastructure adapter adds I/O semantics. */
export interface Backend {
  getCurrentUser(): AdminUser;
  listTenants(params?: ListTenantsParams): Tenant[];
  getTenant(tenantId: string): Tenant;
  getOverviewAnalysis(): OverviewAnalysis;
  createTenant(input: CreateTenantInput, actor: AdminUser): Tenant;
  updateSubscription(tenantId: string, input: UpdateSubscriptionInput, actor: AdminUser): Tenant;
  updateRestaurantStatus(tenantId: string, status: RestaurantStatus, actor: AdminUser): Tenant;
  setFeatureFlag(
    tenantId: string,
    key: PackageFeatureKey,
    enabled: boolean,
    actor: AdminUser,
  ): FeatureFlag;
  listFeatureFlags(tenantId: string): FeatureFlag[];
  addBranch(tenantId: string, input: AddBranchInput, actor: AdminUser): Branch;
  listActivity(params?: ListActivityParams): ActivityLog[];
  listPackages(): PackageDefinition[];
}

export function createBackend(deps: UseCaseDeps, currentUser: CurrentUserProvider): Backend {
  return {
    getCurrentUser: makeGetCurrentUser(currentUser),
    listTenants: makeListTenants(deps.restaurants),
    getTenant: makeGetTenant(deps.restaurants),
    getOverviewAnalysis: makeGetOverviewAnalysis(deps.restaurants, deps.clock),
    createTenant: makeCreateRestaurant(deps),
    updateSubscription: makeUpdateSubscription(deps),
    updateRestaurantStatus: makeUpdateRestaurantStatus(deps),
    setFeatureFlag: makeSetFeatureFlag(deps),
    listFeatureFlags: makeListFeatureFlags(deps),
    addBranch: makeAddBranch(deps),
    listActivity: makeListActivity(deps),
    listPackages: makeListPackages(),
  };
}

export { applyTenantQuery, matchesSearch } from './list-tenants';
