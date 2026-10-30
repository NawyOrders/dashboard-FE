import type { Api } from '@/application/dto';
import type { CurrentUserProvider, UseCaseDeps } from '@/application/ports';
import { createBackend } from '@/application/use-cases';
import { assertEnvironment, IS_DEMO_PROVIDER } from '@/config/data-source';
import { createApiAdapter } from '@/infrastructure/api/api-adapter';
import { createHttpClient } from '@/infrastructure/api/http-client';
import { SystemClock } from '@/infrastructure/clock/system-clock';
import { createSequentialIdGenerator } from '@/infrastructure/ids/sequential-id-generator';
import { StaticActivityLogRepository } from '@/infrastructure/static/static-activity-log-repository';
import { createStaticApi } from '@/infrastructure/static/static-api';
import { StaticAuthRepository } from '@/infrastructure/static/static-auth-repository';
import { loadStaticData } from '@/infrastructure/static/static-data-loader';
import { StaticFeatureFlagRepository } from '@/infrastructure/static/static-feature-flag-repository';
import { StaticFileUploadRepository } from '@/infrastructure/static/static-file-upload-repository';
import { StaticRestaurantRepository } from '@/infrastructure/static/static-restaurant-repository';
import { StaticSalesRepository } from '@/infrastructure/static/static-sales-repository';
import type { AdminUser } from '@/domain/entities';

/** Demo badge is tied to the static data source, never to an environment flag. */
export { IS_DEMO_PROVIDER };

const CURRENT_USER: AdminUser = {
  id: 'acct_seed_1',
  name: 'Demo Super Admin',
  email: 'superadmin@example.com',
  role: 'super_admin',
};

async function buildContainer(): Promise<Api> {
  const env = assertEnvironment();

  const data = await loadStaticData();
  const clock = new SystemClock();
  const ids = createSequentialIdGenerator(10_000);
  const restaurants = new StaticRestaurantRepository(data.restaurants);
  const activity = new StaticActivityLogRepository(clock, ids, data.activityLogs);
  const flags = new StaticFeatureFlagRepository();
  const sales = new StaticSalesRepository(data.sales);
  const auth = new StaticAuthRepository(clock, data.accounts, data.loginFixtures);

  for (const tenant of restaurants.findAll()) {
    flags.seedDefaults(tenant);
  }

  const deps: UseCaseDeps = { restaurants, activity, flags, sales, clock, ids, auth };
  const currentUser: CurrentUserProvider = { get: () => CURRENT_USER };
  const backend = createBackend(deps, currentUser);
  const staticApi = createStaticApi(backend, {}, new StaticFileUploadRepository());

  if (env.VITE_DATA_SOURCE === 'api') {
    const client = createHttpClient({ baseUrl: env.VITE_API_BASE_URL });
    return createApiAdapter({ staticApi, client });
  }

  return staticApi;
}

let apiPromise: Promise<Api> | null = null;

function getApi(): Promise<Api> {
  apiPromise ??= buildContainer();
  return apiPromise;
}

/** Loads the selected data source before the app renders. */
export async function initializeApi(): Promise<void> {
  assertEnvironment();
  await getApi();
}

/**
 * The UI calls the API before/independently of the startup promise. Every `Api` method is
 * async, so this proxy waits for the data source and forwards the call once it is ready.
 */
export const api: Api = new Proxy({} as Api, {
  get(_target, property: string | symbol) {
    return (...args: unknown[]) =>
      getApi().then((resolved) => {
        const method = (resolved as unknown as Record<string | symbol, unknown>)[property];
        if (typeof method !== 'function') {
          throw new Error(`Unknown API method: ${String(property)}`);
        }
        return (method as (...methodArgs: unknown[]) => Promise<unknown>).apply(
          resolved,
          args,
        );
      });
  },
});
