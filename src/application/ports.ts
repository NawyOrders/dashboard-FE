import type {
  Account,
  AccountStatus,
  ActivityLog,
  AdminUser,
  FeatureFlag,
  InternalAccount,
  PackageFeatureKey,
  Permission,
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
   * Verifies the credentials. A tenant account never authenticates on this dashboard:
   * the adapter answers null for it, exactly as it does for a wrong password.
   */
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
