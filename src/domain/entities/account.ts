import type { Role } from './user';

/**
 * NW-247: two kinds of accounts.
 * - `internal`: an account of the organization (nawyorders). Only these sign in here.
 * - `tenant`: an account of one restaurant. It never signs in to this dashboard.
 */
export type AccountType = 'internal' | 'tenant';

export type AccountStatus = 'active' | 'inactive';

/**
 * Roles a tenant account can hold inside its restaurant. `admin` is never offered in
 * the role select: it is created automatically when an application is approved.
 */
export type RestaurantRole = 'cashier' | 'waiter' | 'kitchen' | 'manager';

export type TenantRole = 'admin' | RestaurantRole;

export interface AccountBase {
  id: string;
  accountType: AccountType;
  name: string;
  email: string;
  status: AccountStatus;
  createdAt: string;
}

/** Dashboard account. Only internal accounts sign in to this dashboard. */
export interface InternalAccount extends AccountBase {
  accountType: 'internal';
  role: Role;
}

/** Account of one restaurant. */
export interface TenantAccount extends AccountBase {
  accountType: 'tenant';
  /** The restaurant the account belongs to. */
  tenantId: string;
  restaurantRole: TenantRole;
}

export type Account = InternalAccount | TenantAccount;

export interface CreateAdminAccountInput {
  name: string;
  email: string;
  role: Role;
  /**
   * NW-247: the password of the new dashboard account. The account cannot sign in
   * without one; the create-user form requires it from Step 7 on.
   */
  password?: string;
}
