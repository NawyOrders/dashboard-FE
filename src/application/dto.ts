import type {
  ActivityAction,
  ActivityLog,
  AdminUser,
  Branch,
  CreateAdminAccountInput,
  DurationMonths,
  FeatureFlag,
  InternalAccount,
  MenuExtractedItem,
  PackageCode,
  PackageFeatureKey,
  PlatformLoginResult,
  RestaurantRole,
  RestaurantStatus,
  SubscriptionOffer,
  SubscriptionStatus,
  Tenant,
  TenantProvisioning,
  TenantRole,
  UpdateTenantInput,
} from '@/domain/entities';
import type { EndingSoonEntry, MonthBucket } from '@/domain/rules/overview';
import type { MenuFileProblem } from '@/domain/rules/menu-file';
import type { SalesMonthBucket } from '@/domain/rules/sales';

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

/** NW-247: the password of the signed-in user is changed with these two values. */
export interface ChangeOwnPasswordInput {
  currentPassword: string;
  newPassword: string;
}

/** NW-247: a tenant account as the accounts page shows it. */
export interface TenantAccountView {
  id: string;
  email: string;
  name: string;
  /** The restaurant the account belongs to. */
  tenantId: string;
  restaurantName: string;
  restaurantRole: TenantRole;
  createdAt: string;
}

/** NW-247: the fields of the "create tenant account" form. */
export interface CreateTenantAccountInput {
  tenantId: string;
  /** The role inside the restaurant. `admin` is not selectable. */
  restaurantRole: RestaurantRole;
  email: string;
  password: string;
}

/** NW-247: a Super Admin resets the password of a tenant account. */
export interface ResetTenantAccountPasswordInput {
  accountId: string;
  newPassword: string;
}

/** Live state of a menu OCR job, pushed to the page while it is polled. */
export interface MenuExtractionProgress {
  status: string;
  progressPercentage: number | null;
  stage: string | null;
}

export interface ExtractMenuOptions {
  /** Onboarding request the photo belongs to; sent as the `referenceId` query value. */
  referenceId?: string | null;
  /** Resume polling an already submitted job instead of uploading the file again. */
  jobId?: string;
  signal?: AbortSignal;
  onProgress?: (progress: MenuExtractionProgress) => void;
}

/**
 * Outcome of the menu OCR flow. The extracted rows stay in the page that ran the job;
 * nothing is persisted or sent with the application.
 */
export type MenuExtractionOutcome =
  | {
      status: 'completed';
      jobId: string;
      items: MenuExtractedItem[];
      completedAtUtc: string | null;
    }
  | { status: 'invalid-file'; problem: MenuFileProblem }
  | { status: 'failed'; errorCode: string | null; errorMessage: string | null }
  | { status: 'timeout'; jobId: string };

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

  listAdminAccounts(): Promise<InternalAccount[]>;

  createAdminAccount(input: CreateAdminAccountInput, actor: AdminUser): Promise<InternalAccount>;

  /** NW-247: the signed-in user changes their own password. */
  changeOwnPassword(input: ChangeOwnPasswordInput, actor: AdminUser): Promise<void>;

  /** NW-247: the tenant accounts of the restaurants. */
  listTenantAccounts(): Promise<TenantAccountView[]>;

  createTenantAccount(
    input: CreateTenantAccountInput,
    actor: AdminUser,
  ): Promise<TenantAccountView>;

  /** NW-247: reset the password of a tenant account. */
  resetTenantAccountPassword(
    input: ResetTenantAccountPasswordInput,
    actor: AdminUser,
  ): Promise<void>;
  getMonthlySales(): Promise<SalesMonthBucket[]>;
  listApplications(): Promise<Tenant[]>;
  /** Packages/durations offered by the backend (agent.md section 21). */
  listOffers(): Promise<SubscriptionOffer[]>;
  /** `PATCH /onboarding-requests/{requestId}/payment`. */
  updateApplicationPayment(requestId: string, paid: boolean, actor: AdminUser): Promise<void>;
  /**
   * `POST /onboarding-requests/{requestId}/approve` with no body.
   * OPEN: admin password has no field in approve, backend to confirm.
   */
  approveApplication(requestId: string, actor: AdminUser): Promise<TenantProvisioning>;
  /** `POST /onboarding-requests/{requestId}/reject` with the required reason. */
  rejectApplication(
    requestId: string,
    rejectionReason: string,
    actor: AdminUser,
  ): Promise<void>;
  /** `GET /api/v1/tenants/{tenantId}/provisioning-status`. */
  getTenantStatus(tenantId: string): Promise<TenantProvisioning>;
  /** `POST /api/v1/tenants/{tenantId}/retry` — retries a failed provisioning. */
  retryTenant(tenantId: string, idempotencyKey: string): Promise<TenantProvisioning>;
  /** `PUT /api/v1/tenants/{tenantId}` — names and owner data, before provisioning only. */
  updateTenant(tenantId: string, input: UpdateTenantInput, actor: AdminUser): Promise<Tenant>;
  /** `POST /api/v1/tenants/{tenantId}/plan/activate` — Super Admin, details screen only. */
  activatePlan(tenantId: string, actor: AdminUser): Promise<void>;
  updateApplication(tenantId: string, patch: Partial<Tenant>, actor: AdminUser): Promise<Tenant>;
  /** Stores an uploaded image and returns its reference (NW-246). */
  uploadImage(file: File): Promise<string>;
  /**
   * Menu OCR (public endpoint): validates the file, submits the job, polls it and
   * returns the extracted rows. The result is kept in the page only.
   */
  extractMenu(file: File | null, options?: ExtractMenuOptions): Promise<MenuExtractionOutcome>;
  signIn(email: string, password: string): Promise<PlatformLoginResult>;
}
