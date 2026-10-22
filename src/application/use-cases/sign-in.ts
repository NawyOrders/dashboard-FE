import type { AuthRepository } from '@/application/ports';
import type { AdminUser } from '@/domain/entities';

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInDeps {
  auth: AuthRepository;
  ids?: { next: (prefix: string) => string };
}

export function makeSignIn(deps: SignInDeps) {
  return async (input: SignInInput): Promise<AdminUser> => {
    const account = await deps.auth.findByCredentials(input.email, input.password);
    if (!account) {
      // NW-247: a tenant account gets exactly the same generic error as a wrong
      // password — the dashboard never reveals that the account exists.
      throw new Error('Invalid email or password');
    }
    const id = deps.ids?.next('user') ?? `user_${Date.now()}`;
    return {
      id,
      name: account.name,
      email: account.email,
      role: account.role,
    };
  };
}
