import type { AdminAccountRepository } from '@/application/ports';
import type { AdminAccount } from '@/domain/entities';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** In-memory store. Always returns/stores deep copies so callers cannot mutate state. */
export class InMemoryAdminAccountRepository implements AdminAccountRepository {
  private accounts: AdminAccount[];

  constructor(seed: AdminAccount[] = []) {
    this.accounts = clone(seed);
  }

  findAll(): AdminAccount[] {
    return clone(this.accounts);
  }

  findByEmail(email: string): AdminAccount | null {
    const found = this.accounts.find((account) => account.email === email.toLowerCase());
    return found ? clone(found) : null;
  }

  save(account: AdminAccount): void {
    const index = this.accounts.findIndex((a) => a.id === account.id);
    if (index >= 0) this.accounts[index] = clone(account);
    else this.accounts.push(clone(account));
  }
}
