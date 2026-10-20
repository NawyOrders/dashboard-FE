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
  return (input: SignInInput): AdminUser => {
    const account = deps.auth.findByCredentials(input.email, input.password);
    if (!account) {
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
