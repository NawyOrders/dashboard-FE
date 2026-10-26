import type {
  AuthRepository,
  NewInternalAccount,
  NewTenantAccount,
} from '@/application/ports';
import type {
  Account,
  AccountStatus,
  InternalAccount,
  Role,
  TenantAccount,
} from '@/domain/entities';
import { hashPassword } from '@/infrastructure/security/password-hasher';
import type { LoginFixture } from './static-schemas';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

interface CredentialRecord {
  passwordHash: string;
  isActive: boolean;
  isLockedOut: boolean;
  accountType: 'internal' | 'tenant';
  roles: string[];
}

function platformRoleName(role: Role): string {
  return role === 'super_admin' ? 'SuperAdmin' : 'Support';
}

/**
 * STATIC account store. Account metadata comes from `public/mock/accounts.json` and the
 * demo credentials from `public/mock/auth/login-fixtures.json`.
 *
 * Passwords are hashed in memory. Account creation and password changes only update this
 * in-memory cache; a page refresh restores the fixture values.
 */
export class StaticAuthRepository implements AuthRepository {
  private accounts: Account[];
  private credentials = new Map<string, CredentialRecord>();
  private ready: Promise<void>;

  constructor(seed: Account[] = [], fixtures: LoginFixture[] = []) {
    this.accounts = clone(seed);
    this.ready = Promise.all(
      fixtures.map(async (fixture) => {
        const email = normalizeEmail(fixture.email);
        this.credentials.set(email, {
          passwordHash: await hashPassword(fixture.password),
          isActive: fixture.isActive,
          isLockedOut: fixture.isLockedOut,
          accountType: fixture.accountType,
          roles: fixture.roles,
        });
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
    const normalized = normalizeEmail(email);
    const account = this.accounts.find((candidate) => candidate.email === normalized);
    const credential = this.credentials.get(normalized);
    if (
      !account ||
      !credential ||
      account.accountType !== 'internal' ||
      account.status !== 'active' ||
      !credential.isActive ||
      credential.isLockedOut
    ) {
      return null;
    }
    const candidate = await hashPassword(password);
    if (candidate !== credential.passwordHash) return null;
    return clone(account);
  }

  async createAccount(input: NewInternalAccount): Promise<InternalAccount>;
  async createAccount(input: NewTenantAccount): Promise<TenantAccount>;
  async createAccount(
    input: NewInternalAccount | NewTenantAccount,
  ): Promise<InternalAccount | TenantAccount> {
    await this.ready;
    const email = normalizeEmail(input.email);
    const status: AccountStatus = input.status ?? 'active';
    const account: Account =
      input.accountType === 'internal'
        ? {
            id: input.id,
            accountType: 'internal',
            email,
            name: input.name,
            role: input.role,
            status,
            createdAt: input.createdAt ?? new Date().toISOString(),
          }
        : {
            id: input.id,
            accountType: 'tenant',
            email,
            name: input.name,
            tenantId: input.tenantId,
            restaurantRole: input.restaurantRole,
            status,
            createdAt: input.createdAt ?? new Date().toISOString(),
          };
    this.accounts.push(account);
    this.credentials.set(email, {
      passwordHash: await hashPassword(input.password ?? ''),
      isActive: status === 'active',
      isLockedOut: false,
      accountType: input.accountType,
      roles:
        input.accountType === 'internal'
          ? [platformRoleName(input.role)]
          : [input.restaurantRole],
    });
    return clone(account);
  }

  async updatePassword(accountId: string, password: string): Promise<void> {
    await this.ready;
    const account = this.accounts.find((candidate) => candidate.id === accountId);
    if (!account) {
      throw new Error(`Account ${accountId} was not found.`);
    }
    const existing = this.credentials.get(account.email);
    this.credentials.set(account.email, {
      passwordHash: await hashPassword(password),
      isActive: existing?.isActive ?? account.status === 'active',
      isLockedOut: existing?.isLockedOut ?? false,
      accountType: account.accountType,
      roles:
        existing?.roles ??
        (account.accountType === 'internal'
          ? [platformRoleName(account.role)]
          : [account.restaurantRole]),
    });
  }
}
