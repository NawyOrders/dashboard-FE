import type { CreateTenantAccountInput, TenantAccountView } from '@/application/dto';
import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser } from '@/domain/entities';
import { validatePassword } from '@/domain/rules/password';
import { validateEmail } from '@/domain/rules/validation';
import {
  SELECTABLE_RESTAURANT_ROLE_IDS,
  restaurantRoleLabel,
} from '@/config/restaurant-roles';

export class UnknownRestaurantError extends Error {
  constructor(tenantId: string) {
    super(`Restaurant not found: ${tenantId}`);
    this.name = 'UnknownRestaurantError';
  }
}

export class InvalidRestaurantRoleError extends Error {
  constructor() {
    super('The restaurant role is not selectable.');
    this.name = 'InvalidRestaurantRoleError';
  }
}

export class DuplicateTenantAccountEmailError extends Error {
  constructor(email: string) {
    super(`An account with the email ${email} already exists.`);
    this.name = 'DuplicateTenantAccountEmailError';
  }
}

export class InvalidTenantAccountPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTenantAccountPasswordError';
  }
}

export class InvalidTenantAccountEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTenantAccountEmailError';
  }
}

/**
 * NW-247: a Super Admin creates an account for one restaurant. The `admin` role is not
 * selectable: that account is created when the application is approved.
 */
export function makeCreateTenantAccount(deps: UseCaseDeps) {
  return async function createTenantAccount(
    input: CreateTenantAccountInput,
    actor: AdminUser,
  ): Promise<TenantAccountView> {
    const { auth, activity, clock, ids, restaurants } = deps;

    const restaurant = restaurants.findById(input.tenantId);
    if (!restaurant) throw new UnknownRestaurantError(input.tenantId);
    if (!SELECTABLE_RESTAURANT_ROLE_IDS.includes(input.restaurantRole)) {
      throw new InvalidRestaurantRoleError();
    }

    const email = input.email.trim().toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) {
      throw new InvalidTenantAccountEmailError(emailError);
    }
    if (await auth.findByEmail(email)) {
      throw new DuplicateTenantAccountEmailError(email);
    }

    const policyError = validatePassword(input.password);
    if (policyError) {
      throw new InvalidTenantAccountPasswordError(policyError);
    }

    const roleLabel = restaurantRoleLabel(input.restaurantRole);
    const account = await auth.createAccount({
      id: ids.next('tacct'),
      name: `${restaurant.restaurantName} — ${roleLabel}`,
      email,
      accountType: 'tenant',
      tenantId: restaurant.id,
      restaurantRole: input.restaurantRole,
      password: input.password,
      createdAt: clock.nowIso(),
    });

    activity.append({
      actor,
      action: 'account_created',
      target: {
        type: 'account',
        tenantId: restaurant.id,
        label: `${account.email} — ${restaurant.restaurantName}`,
      },
      previousValue: null,
      newValue: `${account.email} — ${roleLabel}`,
    });

    return {
      id: account.id,
      email: account.email,
      name: account.name,
      tenantId: account.tenantId,
      restaurantName: restaurant.restaurantName,
      restaurantRole: account.restaurantRole,
      createdAt: account.createdAt,
    };
  };
}
