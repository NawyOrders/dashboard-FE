import type {
  ActivityAction,
  ActivityLog,
  AdminAccount,
  AdminUser,
  Branch,
  CreateAdminAccountInput,
  DurationMonths,
  FeatureFlag,
  PackageCode,
  PackageFeatureKey,
  RestaurantStatus,
  SubscriptionStatus,
  Tenant,
} from '@/domain/entities';
import type { EndingSoonEntry, MonthBucket } from '@/domain/rules/overview';
import type { RevenuePeriodDays } from '@/domain/rules/revenue';

export type TenantSort = 'newest' | 'oldest' | 'name_asc' | 'expiry_asc';

export interface RevenueSummary {
  periodDays: RevenuePeriodDays;
  totalEgp: number;
  recordCount: number;
  from: string;
  to: string;
}

export interface ListTenantsParams {
  /** Free text ΓÇö matches business name, restaurant name or Tenant ID. */
  search?: string;
  packageCode?: PackageCode;
  restaurantStatus?: RestaurantStatus;
  subscriptionStatus?: SubscriptionStatus;
  expiringSoon?: boolean;
  growthOnly?: boolean;
  sort?: TenantSort;
}

export interface UpdateSubscriptionInput {
  packageCode: PackageCode;
  durationMonths: DurationMonths;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
}

export interface AddBranchInput {
  name: string;
  address: string;
  phone: string;
  status: Branch['status'];
}

export interface ListActivityParams {
  tenantId?: string;
  action?: ActivityAction;
  from?: string;
  to?: string;
}

/** Everything the Overview analysis section (Phase 3b) needs, in one payload. */
export interface OverviewAnalysis {
  contractsPerMonth: MonthBucket[];
  latestContracts: Tenant[];
  endingSoon: EndingSoonEntry[];
}

/**
 * The single application contract the presentation layer depends on.
 * The infrastructure mock (or a future HTTP client) implements it; components never
 * import an adapter directly. Every tenant-scoped function takes a `tenantId`.
 */
export interface Api {
  getCurrentUser(): Promise<AdminUser>;

  listTenants(params?: ListTenantsParams): Promise<Tenant[]>;
  getTenant(tenantId: string): Promise<Tenant>;
  getOverviewAnalysis(): Promise<OverviewAnalysis>;


  updateSubscription(
    tenantId: string,
    input: UpdateSubscriptionInput,
    actor: AdminUser,
  ): Promise<Tenant>;

  updateRestaurantStatus(
    tenantId: string,
    status: RestaurantStatus,
    actor: AdminUser,
  ): Promise<Tenant>;

  setFeatureFlag(
    tenantId: string,
    key: PackageFeatureKey,
    enabled: boolean,
    actor: AdminUser,
  ): Promise<FeatureFlag>;

  listFeatureFlags(tenantId: string): Promise<FeatureFlag[]>;

  addBranch(tenantId: string, input: AddBranchInput, actor: AdminUser): Promise<Branch>;

  listActivity(params?: ListActivityParams): Promise<ActivityLog[]>;

  listAdminAccounts(): Promise<AdminAccount[]>;

  createAdminAccount(input: CreateAdminAccountInput, actor: AdminUser): Promise<AdminAccount>;
  getTotalRevenue(periodDays: RevenuePeriodDays): Promise<RevenueSummary>;
  listApplications(): Promise<Tenant[]>;
  approveApplication(tenantId: string, actor: AdminUser): Promise<Tenant>;
}
