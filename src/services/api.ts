import type {
  ActivityAction,
  ActivityLog,
  AdminUser,
  Branch,
  CreateTenantInput,
  DurationMonths,
  FeatureFlag,
  PackageCode,
  PackageDefinition,
  PackageFeatureKey,
  RestaurantStatus,
  SubscriptionStatus,
  Tenant,
} from '@/types';

export type TenantSort = 'newest' | 'oldest' | 'name_asc' | 'expiry_asc';

export interface ListTenantsParams {
  /** Free text — matches business name, restaurant name or Tenant ID. */
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

/**
 * The single contract the UI depends on.
 * The mock implementation in `services/mock` can be swapped for a real HTTP client
 * without touching any component. Every tenant-scoped function takes a `tenantId`.
 */
export interface Api {
  getCurrentUser(): Promise<AdminUser>;

  listTenants(params?: ListTenantsParams): Promise<Tenant[]>;
  getTenant(tenantId: string): Promise<Tenant>;

  createTenant(input: CreateTenantInput, actor: AdminUser): Promise<Tenant>;

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

  listPackages(): Promise<PackageDefinition[]>;
}
