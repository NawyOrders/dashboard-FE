import type {
  ActivityLog,
  AdminAccount,
  AdminUser,
  FeatureFlag,
  PackageFeatureKey,
  Permission,
  Role,
  SalesRecord,
  Tenant,
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

export interface AdminAccountRepository {
  findAll(): AdminAccount[];
  findByEmail(email: string): AdminAccount | null;
  save(account: AdminAccount): void;
}

export interface SalesRepository {
  findAll(): SalesRecord[];
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
  accounts: AdminAccountRepository;
  sales: SalesRepository;
  clock: Clock;
  ids: IdGenerator;
}

export type { FeatureFlag, PackageFeatureKey };
