import type {
  AddBranchInput,
  Api,
  ListActivityParams,
  ListTenantsParams,
  UpdateSubscriptionInput,
} from '@/application/dto';
import type { Backend } from '@/application/use-cases';
import type {
  AdminUser,
  CreateAdminAccountInput,
  PackageFeatureKey,
  RestaurantStatus,
} from '@/domain/entities';
import type { RevenuePeriodDays } from '@/domain/rules/revenue';

export const CURRENT_USER: AdminUser = {
  id: 'u_1',
  name: 'Nour Hassan',
  email: 'nour.hassan@nawy.example.com',
  role: 'super_admin',
};

export interface MockApiOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function forcedErrorActive(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('mockError') === '1';
}

/**
 * Infrastructure adapter: gives the synchronous, framework-free `Backend` the I/O
 * characteristics of a real API — latency, cloning and a forced-error switch
 * (`?mockError=1`). Swap this adapter for an HTTP client without touching the app.
 */
export function createMockApi(backend: Backend, options: MockApiOptions = {}): Api {
  const minDelayMs = options.minDelayMs ?? 300;
  const maxDelayMs = options.maxDelayMs ?? 600;

  async function run<T>(fn: () => T): Promise<T> {
    const ms = minDelayMs + Math.random() * Math.max(0, maxDelayMs - minDelayMs);
    await new Promise((resolve) => setTimeout(resolve, ms));
    if (forcedErrorActive()) {
      throw new Error('Simulated API error (mockError=1)');
    }
    return clone(fn());
  }

  return {
    getCurrentUser: () => run(() => backend.getCurrentUser()),
    listTenants: (params?: ListTenantsParams) => run(() => backend.listTenants(params)),
    getTenant: (tenantId: string) => run(() => backend.getTenant(tenantId)),
    getOverviewAnalysis: () => run(() => backend.getOverviewAnalysis()),
    updateSubscription: (tenantId: string, input: UpdateSubscriptionInput, actor: AdminUser) =>
      run(() => backend.updateSubscription(tenantId, input, actor)),
    updateRestaurantStatus: (tenantId: string, status: RestaurantStatus, actor: AdminUser) =>
      run(() => backend.updateRestaurantStatus(tenantId, status, actor)),
    setFeatureFlag: (
      tenantId: string,
      key: PackageFeatureKey,
      enabled: boolean,
      actor: AdminUser,
    ) => run(() => backend.setFeatureFlag(tenantId, key, enabled, actor)),
    listFeatureFlags: (tenantId: string) => run(() => backend.listFeatureFlags(tenantId)),
    addBranch: (tenantId: string, input: AddBranchInput, actor: AdminUser) =>
      run(() => backend.addBranch(tenantId, input, actor)),
    listActivity: (params?: ListActivityParams) => run(() => backend.listActivity(params)),
    listAdminAccounts: () => run(() => backend.listAdminAccounts()),
    createAdminAccount: (input: CreateAdminAccountInput, actor: AdminUser) =>
      run(() => backend.createAdminAccount(input, actor)),
    getTotalRevenue: (periodDays: RevenuePeriodDays) =>
      run(() => backend.getTotalRevenue(periodDays)),
    getMonthlySales: () => run(() => backend.getMonthlySales()),
    listApplications: () => run(() => backend.listApplications()),
    approveApplication: (tenantId: string, actor: AdminUser) =>
      run(() => backend.approveApplication(tenantId, actor)),
  };
}
