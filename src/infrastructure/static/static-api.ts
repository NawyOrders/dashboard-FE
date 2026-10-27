import type {
  AddBranchInput,
  Api,
  ChangeOwnPasswordInput,
  CreateTenantAccountInput,
  ListActivityParams,
  ListTenantsParams,
  ResetTenantAccountPasswordInput,
  UpdateSubscriptionInput,
} from '@/application/dto';
import type { Backend } from '@/application/use-cases';
import type { FileUploadRepository } from '@/application/ports';
import type {
  AdminUser,
  CreateAdminAccountInput,
  PackageFeatureKey,
  RestaurantStatus,
  TenantProvisioning,
} from '@/domain/entities';
import { toTenantSlug } from '@/domain/rules/slug';
import { STATIC_OFFERS } from './static-offers';

export interface StaticApiOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
}

function clone<T>(value: T): T {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function forcedErrorActive(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('staticError') === '1';
}

/**
 * Presentation-facing STATIC API adapter. It gives the synchronous use cases the I/O
 * shape of an HTTP client (latency, cloning and a forced-error switch, `?staticError=1`).
 */
export function createStaticApi(
  backend: Backend,
  options: StaticApiOptions = {},
  uploads: FileUploadRepository,
): Api {
  const minDelayMs = options.minDelayMs ?? 300;
  const maxDelayMs = options.maxDelayMs ?? 600;

  async function run<T>(fn: () => T | Promise<T>): Promise<T> {
    const ms = minDelayMs + Math.random() * Math.max(0, maxDelayMs - minDelayMs);
    await new Promise((resolve) => setTimeout(resolve, ms));
    if (forcedErrorActive()) {
      throw new Error('Simulated static data error (staticError=1)');
    }
    return clone(await fn());
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
    // OPEN: endpoint missing in swagger.
    listAdminAccounts: () => run(() => backend.listAdminAccounts()),
    // OPEN: endpoint missing in swagger.
    createAdminAccount: (input: CreateAdminAccountInput, actor: AdminUser) =>
      run(() => backend.createAdminAccount(input, actor)),
    // OPEN: endpoint missing in swagger.
    changeOwnPassword: (input: ChangeOwnPasswordInput, actor: AdminUser) =>
      run(() => backend.changeOwnPassword(input, actor)),
    // OPEN: endpoint missing in swagger.
    listTenantAccounts: () => run(() => backend.listTenantAccounts()),
    // OPEN: endpoint missing in swagger.
    createTenantAccount: (input: CreateTenantAccountInput, actor: AdminUser) =>
      run(() => backend.createTenantAccount(input, actor)),
    // OPEN: endpoint missing in swagger.
    resetTenantAccountPassword: (
      input: ResetTenantAccountPasswordInput,
      actor: AdminUser,
    ) => run(() => backend.resetTenantAccountPassword(input, actor)),
    getMonthlySales: () => run(() => backend.getMonthlySales()),
    listApplications: () => run(() => backend.listApplications()),
    listOffers: () => run(() => STATIC_OFFERS),
    updateApplicationPayment: (requestId: string, paid: boolean, actor: AdminUser) =>
      run(() =>
        backend.updateApplication(
          requestId,
          { paymentStatus: paid ? 'paid' : 'unpaid' },
          actor,
        ),
      ).then(() => undefined),
    // OPEN: endpoint missing in swagger.
    approveApplication: (tenantId: string, adminPassword: string, actor: AdminUser) =>
      run<TenantProvisioning>(async () => {
        const tenant = await backend.approveApplication(tenantId, adminPassword, actor);
        return {
          tenantId: tenant.id,
          slug: toTenantSlug(tenant.restaurantName),
          status: 'active',
          activatedAtUtc: null,
        };
      }),
    // OPEN: static approve, remove when api is live
    getTenantStatus: (tenantId: string) =>
      run<TenantProvisioning>(() => ({
        tenantId,
        slug: null,
        status: 'active',
        activatedAtUtc: null,
      })),
    // OPEN: static approve, remove when api is live
    retryTenant: (tenantId: string) =>
      run<TenantProvisioning>(() => ({
        tenantId,
        slug: null,
        status: 'active',
        activatedAtUtc: null,
      })),
    // OPEN: endpoint missing in swagger.
    updateApplication: (
      tenantId: string,
      patch: Partial<import('@/domain/entities').Tenant>,
      actor: AdminUser,
    ) => run(() => backend.updateApplication(tenantId, patch, actor)),
    // OPEN: endpoint missing in swagger.
    deleteApplication: (tenantId: string, reason: string, actor: AdminUser) =>
      run(() => backend.deleteApplication(tenantId, reason, actor)),
    uploadImage: (file: File) => uploads.uploadImage(file),
    signIn: (email: string, password: string) =>
      run(() => backend.signIn({ email, password })),
  };
}
