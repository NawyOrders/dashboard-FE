import type {
  AddBranchInput,
  ChangeOwnPasswordInput,
  CreateTenantAccountInput,
  ListActivityParams,
  ListTenantsParams,
  OverviewAnalysis,
  ResetTenantAccountPasswordInput,
  TenantAccountView,
  UpdateSubscriptionInput,
} from '@/application/dto';
import type { CurrentUserProvider, UseCaseDeps } from '@/application/ports';
import type {
  ActivityLog,
  AdminUser,
  Branch,
  CreateAdminAccountInput,
  FeatureFlag,
  InternalAccount,
  PackageFeatureKey,
  PlatformLoginRequest,
  PlatformLoginResult,
  RestaurantStatus,
  Tenant,
} from '@/domain/entities';
import type { SalesMonthBucket } from '@/domain/rules/sales';
import { makeListTenants } from './list-tenants';
import { makeGetTenant } from './get-tenant';
import { makeUpdateSubscription } from './update-subscription';
import { makeUpdateRestaurantStatus } from './update-restaurant-status';
import { makeSetFeatureFlag } from './set-feature-flag';
import { makeListFeatureFlags } from './list-feature-flags';
import { makeAddBranch } from './add-branch';
import { makeListActivity } from './list-activity';
import { makeGetCurrentUser } from './get-current-user';
import { makeGetOverviewAnalysis } from './get-overview-analysis';
import { makeListAdminAccounts } from './list-admin-accounts';
import { makeCreateAdminAccount } from './create-admin-account';
import { makeChangeOwnPassword } from './change-own-password';
import { makeListTenantAccounts } from './list-tenant-accounts';
import { makeCreateTenantAccount } from './create-tenant-account';
import { makeResetTenantAccountPassword } from './reset-tenant-account-password';
import { makeGetMonthlySales } from './get-monthly-sales';
import { makeListApplications } from './list-applications';
import { makeApproveApplication } from './approve-application';
import { makeUpdateApplication } from './update-application';
import { makeDeleteApplication } from './delete-application';
import { makeSignIn } from './sign-in';

/**
 * Framework-free core. The infrastructure adapter adds I/O semantics. The account
 * functions are asynchronous because the account store hashes passwords (NW-247).
 */
export interface Backend {
  getCurrentUser(): AdminUser;
  listTenants(params?: ListTenantsParams): Tenant[];
  getTenant(tenantId: string): Tenant;
  getOverviewAnalysis(): OverviewAnalysis;
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
  listAdminAccounts(): Promise<InternalAccount[]>;
  createAdminAccount(input: CreateAdminAccountInput, actor: AdminUser): Promise<InternalAccount>;
  changeOwnPassword(input: ChangeOwnPasswordInput, actor: AdminUser): Promise<void>;
  listTenantAccounts(): Promise<TenantAccountView[]>;
  createTenantAccount(
    input: CreateTenantAccountInput,
    actor: AdminUser,
  ): Promise<TenantAccountView>;
  resetTenantAccountPassword(
    input: ResetTenantAccountPasswordInput,
    actor: AdminUser,
  ): Promise<void>;
  getMonthlySales(): SalesMonthBucket[];
  listApplications(): Tenant[];
  approveApplication(
    tenantId: string,
    adminPassword: string,
    actor: AdminUser,
    subscriptionStartDate: string,
  ): Promise<Tenant>;
  updateApplication(tenantId: string, patch: Partial<Tenant>, actor: AdminUser): Tenant;
  deleteApplication(tenantId: string, reason: string, actor: AdminUser): void;
  signIn(input: PlatformLoginRequest): Promise<PlatformLoginResult>;
}

export function createBackend(deps: UseCaseDeps, currentUser: CurrentUserProvider): Backend {
  const signIn = makeSignIn({ auth: deps.auth });
  return {
    getCurrentUser: makeGetCurrentUser(currentUser),
    listTenants: makeListTenants(deps.restaurants),
    getTenant: makeGetTenant(deps.restaurants),
    getOverviewAnalysis: makeGetOverviewAnalysis(deps.restaurants, deps.clock),
    updateSubscription: makeUpdateSubscription(deps),
    updateRestaurantStatus: makeUpdateRestaurantStatus(deps),
    setFeatureFlag: makeSetFeatureFlag(deps),
    listFeatureFlags: makeListFeatureFlags(deps),
    addBranch: makeAddBranch(deps),
    listActivity: makeListActivity(deps),
    listAdminAccounts: makeListAdminAccounts(deps),
    createAdminAccount: makeCreateAdminAccount(deps),
    changeOwnPassword: makeChangeOwnPassword(deps),
    listTenantAccounts: makeListTenantAccounts(deps),
    createTenantAccount: makeCreateTenantAccount(deps),
    resetTenantAccountPassword: makeResetTenantAccountPassword(deps),
    getMonthlySales: makeGetMonthlySales(deps.sales, deps.clock),
    listApplications: makeListApplications(deps.restaurants),
    approveApplication: makeApproveApplication(deps),
    updateApplication: makeUpdateApplication(deps),
    deleteApplication: makeDeleteApplication(deps),
    signIn: (input: PlatformLoginRequest) => signIn(input),
  };
}

export { applyTenantQuery, matchesSearch } from './list-tenants';
