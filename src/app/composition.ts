import type { Api } from '@/application/dto';
import type { CurrentUserProvider, UseCaseDeps } from '@/application/ports';
import { createBackend } from '@/application/use-cases';
import { SystemClock } from '@/infrastructure/clock/system-clock';
import { createSequentialIdGenerator } from '@/infrastructure/ids/sequential-id-generator';
import { CURRENT_USER, createMockApi } from '@/infrastructure/mock/mock-api';
import { InMemoryActivityLogRepository } from '@/infrastructure/repositories/in-memory-activity-log-repository';
import { InMemoryAuthRepository } from '@/infrastructure/repositories/in-memory-auth-repository';
import { InMemoryFeatureFlagRepository } from '@/infrastructure/repositories/in-memory-feature-flag-repository';
import { InMemoryRestaurantRepository } from '@/infrastructure/repositories/in-memory-restaurant-repository';
import { InMemorySalesRepository } from '@/infrastructure/repositories/in-memory-sales-repository';
import { MockFileUploadRepository } from '@/infrastructure/repositories/mock-file-upload-repository';
import {
  buildSeedAccounts,
  buildSeedActivity,
  buildSeedSales,
  buildSeedTenantAccounts,
  buildSeedTenants,
} from '@/infrastructure/seed/seed';

/** Demo badge is tied to the mock provider, never to a hard-coded environment flag. */
export const IS_MOCK_PROVIDER = true;

function buildContainer(): Api {
  const clock = new SystemClock();
  const ids = createSequentialIdGenerator(10_000);
  const restaurants = new InMemoryRestaurantRepository(buildSeedTenants());
  const activity = new InMemoryActivityLogRepository(clock, ids, buildSeedActivity(restaurants.findAll()));
  const flags = new InMemoryFeatureFlagRepository();
  const sales = new InMemorySalesRepository(buildSeedSales(restaurants.findAll()));
  // NW-247: internal and tenant accounts share one store; only internal accounts
  // sign in to this dashboard.
  const auth = new InMemoryAuthRepository([
    ...buildSeedAccounts(),
    ...buildSeedTenantAccounts(restaurants.findAll()),
  ]);

  for (const tenant of restaurants.findAll()) {
    flags.seedDefaults(tenant);
  }

  const deps: UseCaseDeps = { restaurants, activity, flags, sales, clock, ids, auth };
  const currentUser: CurrentUserProvider = { get: () => CURRENT_USER };
  const backend = createBackend(deps, currentUser);

  return createMockApi(backend, {}, new MockFileUploadRepository());
}

export const api: Api = buildContainer();
