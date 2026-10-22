import type {
  AuthRepository,
  CreateInternalAccountInput,
  CreateTenantAccountInput,
} from '@/application/ports';
import type {
  Account,
  AccountStatus,
  AccountType,
  InternalAccount,
  Role,
  TenantAccount,
  TenantRole,
} from '@/domain/entities';
import { hashPassword } from '@/infrastructure/security/password-hasher';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** A seeded account. The plain password is hashed once, before the first lookup. */
export interface SeedAuthAccount {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  role?: Role;
  tenantId?: string;
  restaurantRole?: TenantRole;
  password?: string;
  status?: AccountStatus;
  createdAt: string;
}

function toAccount(seed: SeedAuthAccount): Account {
  const base = {
    id: seed.id,
    email: normalizeEmail(seed.email),
    name: seed.name,
    status: seed.status ?? 'active',
    createdAt: seed.createdAt,
  };
  if (seed.accountType === 'internal') {
    return { ...base, accountType: 'internal', role: seed.role ?? 'support' };
  }
  return {
    ...base,
    accountType: 'tenant',
    tenantId: seed.tenantId ?? '',
    restaurantRole: seed.restaurantRole ?? 'waiter',
  };
}

/**
 * In-memory account store (NW-247). Passwords are kept as SHA-256 hashes only; the
 * plain password never leaves this adapter, and no hash is ever handed back to the
 * application layer.
 */
export class InMemoryAuthRepository implements AuthRepository {
  private accounts: Account[] = [];
  private hashes = new Map<string, string>();
  private ready: Promise<void>;

  constructor(seed: SeedAuthAccount[] = []) {
    this.accounts = seed.map(toAccount);
    this.ready = Promise.all(
      seed
        .filter((account) => typeof account.password === 'string')
        .map(async (account) => {
          this.hashes.set(
            normalizeEmail(account.email),
            await hashPassword(account.password as string),
          );
        }),
    ).then(() => undefined);
  }

  async findAll(): Promise<Account[]> {
    await this.ready;
    return clone(this.accounts);
  }

  async findById(accountId: string): Promise<Account | null> {
    await this.ready;
    const found = this.accounts.find((account) => account.id === accountId);
    return found ? clone(found) : null;
  }

  async findByEmail(email: string): Promise<Account | null> {
    await this.ready;
    const found = this.accounts.find(
      (account) => account.email === normalizeEmail(email),
    );
    return found ? clone(found) : null;
  }

  async findByCredentials(email: string, password: string): Promise<InternalAccount | null> {
    await this.ready;
    const account = this.accounts.find(
      (candidate) => candidate.email === normalizeEmail(email),
    );
    // NW-247: a tenant account never signs in to this dashboard, and an inactive
    // account never signs in either. Both answer exactly like a wrong password.
    if (!account || account.accountType !== 'internal' || account.status !== 'active') {
      return null;
    }
    const stored = this.hashes.get(account.email);
    if (!stored) return null;
    const candidate = await hashPassword(password);
    if (candidate !== stored) return null;
    return clone(account);
  }

  async createAccount(input: CreateInternalAccountInput): Promise<InternalAccount>;
  async createAccount(input: CreateTenantAccountInput): Promise<TenantAccount>;
  async createAccount(
    input: CreateInternalAccountInput | CreateTenantAccountInput,
  ): Promise<InternalAccount | TenantAccount> {
    await this.ready;
    const account: Account =
      input.accountType === 'internal'
        ? {
            id: input.id,
            accountType: 'internal',
            email: normalizeEmail(input.email),
            name: input.name,
            role: input.role,
            status: input.status ?? 'active',
            createdAt: input.createdAt ?? new Date().toISOString(),
          }
        : {
            id: input.id,
            accountType: 'tenant',
            email: normalizeEmail(input.email),
            name: input.name,
            tenantId: input.tenantId,
            restaurantRole: input.restaurantRole,
            status: input.status ?? 'active',
            createdAt: input.createdAt ?? new Date().toISOString(),
          };
    this.accounts.push(account);
    if (input.password) {
      this.hashes.set(account.email, await hashPassword(input.password));
    }
    return clone(account);
  }

  async updatePassword(accountId: string, password: string): Promise<void> {
    await this.ready;
    const account = this.accounts.find((candidate) => candidate.id === accountId);
    if (!account) {
      throw new Error(`Account ${accountId} was not found.`);
    }
    this.hashes.set(account.email, await hashPassword(password));
  }
}
