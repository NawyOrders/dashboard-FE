import type {
  Account,
  AccountStatus,
  ActivityLog,
  AdminUser,
  FeatureFlag,
  InternalAccount,
  MenuOcrResultPayload,
  MenuOcrStatus,
  MenuOcrSubmission,
  PackageFeatureKey,
  Permission,
  PlatformLoginRequest,
  PlatformLoginResult,
  Role,
  SalesRecord,
  Tenant,
  TenantAccount,
  TenantRole,
} from '@/domain/entities';

/**
 * Ports (interfaces) the application layer depends on. Infrastructure provides adapters.
 * Dependencies point inward: domain ← application ← infrastructure/presentation.
 */

/** Tenant-scoped persistence. Implementations must store and return copies. */
export interface RestaurantRepository {
  findAll(): Tenant[];
  findById(tenantId: string): Tenant | null;
  save(tenant: Tenant): void;
}

export interface ActivityLogRepository {
  findAll(): ActivityLog[];
  append(entry: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog;
}

export interface FeatureFlagRepository {
  findByTenant(tenantId: string): FeatureFlag[];
  save(flag: FeatureFlag): void;
  seedDefaults(tenant: Tenant): void;
}

export interface NewInternalAccount {
  id: string;
  email: string;
  name: string;
  accountType: 'internal';
  role: Role;
  /**
   * The plain password. The adapter stores a hash only — the password itself never
   * reaches the store, an activity log or the console.
   */
  password?: string;
  status?: AccountStatus;
  createdAt?: string;
}

export interface NewTenantAccount {
  id: string;
  email: string;
  name: string;
  accountType: 'tenant';
  tenantId: string;
  restaurantRole: TenantRole;
  password?: string;
  status?: AccountStatus;
  createdAt?: string;
}

/**
 * Account store (NW-247). Internal dashboard accounts and tenant restaurant accounts
 * live in the same store, separated by `accountType`.
 */
export interface AuthRepository {
  findAll(): Promise<Account[]>;
  findById(accountId: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  /**
   * Platform sign-in (agent.md section 18). Failures are returned as values, never
   * thrown. A tenant account always gets `Auth.InvalidCredentials`.
   */
  signIn(input: PlatformLoginRequest): Promise<PlatformLoginResult>;
  /** Verifies credentials for password-change flows; `null` means no/internal failure. */
  findByCredentials(email: string, password: string): Promise<InternalAccount | null>;
  createAccount(input: NewInternalAccount): Promise<InternalAccount>;
  createAccount(input: NewTenantAccount): Promise<TenantAccount>;
  /** Replaces the stored password of an account. */
  updatePassword(accountId: string, password: string): Promise<void>;
}

export interface SalesRepository {
  findAll(): SalesRecord[];
}

/**
 * Image uploads (NW-246). The registration form stores uploaded images through this
 * port; the mock adapter keeps them as data URLs until a real upload endpoint exists.
 */
export interface FileUploadRepository {
  /** Returns the stored reference (a data URL in the mock adapter). */
  uploadImage(file: File): Promise<string>;
}

/**
 * Menu OCR backend (public endpoint, no Bearer token). The polling policy — Retry-After,
 * backoff and the overall timeout — lives in the application layer, not here.
 */
export interface MenuOcrSubmitOptions {
  /** Onboarding request the photo belongs to; sent as the `referenceId` query value. */
  referenceId?: string | null;
  signal?: AbortSignal;
}

export interface MenuOcrPort {
  submit(file: File, options?: MenuOcrSubmitOptions): Promise<MenuOcrSubmission>;
  getStatus(jobId: string, signal?: AbortSignal): Promise<MenuOcrStatus>;
  getResult(jobId: string, signal?: AbortSignal): Promise<MenuOcrResultPayload>;
}

/** Injectable time source so business rules and tests are deterministic. */
export interface Clock {
  now(): Date;
  nowIso(): string;
}

/** Monotonic id factory; the mock uses `prefix_timestamp_counter`. */
export interface IdGenerator {
  next(prefix: string): string;
}

export interface PermissionPolicy {
  isAllowed(role: Role, permission: Permission): boolean;
}

export interface CurrentUserProvider {
  get(): AdminUser;
}

export interface UseCaseDeps {
  restaurants: RestaurantRepository;
  activity: ActivityLogRepository;
  flags: FeatureFlagRepository;
  sales: SalesRepository;
  clock: Clock;
  ids: IdGenerator;
  auth: AuthRepository;
}

export type { FeatureFlag, PackageFeatureKey };
