import type { z } from 'zod';
import type {
  Account,
  ActivityLog,
  PackageDefinition,
  SalesRecord,
  Tenant,
} from '@/domain/entities';
import {
  accountsSchema,
  activityLogsSchema,
  loginFixturesSchema,
  packagesSchema,
  salesSchema,
  tenantsSchema,
  type LoginFixture,
} from './static-schemas';

export interface StaticData {
  restaurants: Tenant[];
  applications: Tenant[];
  sales: SalesRecord[];
  accounts: Account[];
  packages: PackageDefinition[];
  activityLogs: ActivityLog[];
  loginFixtures: LoginFixture[];
}

let cache: Promise<StaticData> | null = null;

async function readJson<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`/mock/${file}`);
  if (!response.ok) {
    throw new Error(`Could not load /mock/${file} (HTTP ${response.status}).`);
  }
  return schema.parse(await response.json());
}

/**
 * STATIC data source (agent.md section 17).
 *
 * Every file is fetched once and cached for the lifetime of the page. Writes made by the
 * repositories only change this in-memory cache; a refresh reloads the original JSON.
 */
export function loadStaticData(): Promise<StaticData> {
  cache ??= Promise.all([
    readJson('restaurants.json', tenantsSchema),
    readJson('applications.json', tenantsSchema),
    readJson('sales.json', salesSchema),
    readJson('accounts.json', accountsSchema),
    readJson('packages.json', packagesSchema),
    readJson('activity-logs.json', activityLogsSchema),
    readJson('auth/login-fixtures.json', loginFixturesSchema),
  ]).then(
    ([restaurants, applications, sales, accounts, packages, activityLogs, loginFixtures]) => ({
      restaurants,
      applications,
      sales,
      accounts,
      packages,
      activityLogs,
      loginFixtures: loginFixtures.users,
    }),
  );
  return cache;
}
