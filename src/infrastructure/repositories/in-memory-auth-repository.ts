import type { AuthAccount, AuthRepository } from '@/application/ports';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class InMemoryAuthRepository implements AuthRepository {
  private accounts: AuthAccount[];

  constructor(seed: AuthAccount[] = []) {
    this.accounts = clone(seed);
  }

  findByCredentials(email: string, password: string): AuthAccount | null {
    const found = this.accounts.find(
      (account) =>
        account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password,
    );
    return found ? clone(found) : null;
  }
}
