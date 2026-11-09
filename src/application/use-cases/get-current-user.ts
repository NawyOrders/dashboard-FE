import type { AdminUser } from '@/domain/entities';
import type { CurrentUserProvider } from '@/application/ports';

export function makeGetCurrentUser(provider: CurrentUserProvider) {
  return function getCurrentUser(): AdminUser {
    return provider.get();
  };
}
