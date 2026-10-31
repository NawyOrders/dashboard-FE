import type {
  AddBranchInput,
  Api,
  ChangeOwnPasswordInput,
  CreateTenantAccountInput,
  ListActivityParams,
  ListTenantsParams,
  MenuExtractionOutcome,
  OverviewEndingSoonResult,
  OverviewLatestContract,
  ResetTenantAccountPasswordInput,
  UpdateApplicationInput,
  UpdateSubscriptionInput,
} from '@/application/dto';
import type { Backend } from '@/application/use-cases';
import type { FileUploadRepository } from '@/application/ports';
import {
  OVERVIEW_ENDING_WITHIN_DAYS,
  OVERVIEW_LATEST_CONTRACTS_COUNT,
} from '@/config/policy';
import type {
  AdminUser,
  Branch,
  CreateAdminAccountInput,
  PackageFeatureKey,
  PlatformLoginResponse,
  RestaurantStatus,
  Tenant,
  TenantProvisioning,
  UpdateTenantInput,
} from '@/domain/entities';
import { contractDate, endingSoon, latestContractsByActivation } from '@/domain/rules/overview';
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

/** Demo fallback: maps the onboarding PATCH body onto the static tenant model. */
function applicationInputToTenantPatch(
  current: Tenant,
  input: UpdateApplicationInput,
): Partial<Tenant> {
  const patch: Partial<Tenant> = {};

  if (input.restaurantNameEn !== undefined) {
    patch.restaurantName = input.restaurantNameEn ?? '';
    patch.businessName = patch.restaurantName;
  }
  if (input.restaurantNameAr !== undefined) patch.restaurantNameAr = input.restaurantNameAr;

  if (
    input.ownerFullName !== undefined ||
    input.ownerEmail !== undefined ||
    input.ownerPhone !== undefined
  ) {
    patch.contact = {
      ...current.contact,
      ...(input.ownerFullName !== undefined ? { name: input.ownerFullName ?? '' } : {}),
      ...(input.ownerEmail !== undefined ? { email: input.ownerEmail ?? '' } : {}),
      ...(input.ownerPhone !== undefined ? { phone: input.ownerPhone ?? '' } : {}),
    };
  }

  if (input.branches !== undefined) {
    patch.branches = input.branches.map((branch, index) => {
      const existing = current.branches[index];
      const openDay = branch.workingHours.find((hour) => !hour.isClosed);
      const next: Branch = {
        id: existing?.id ?? `${current.id}-branch-${index + 1}`,
        tenantId: current.id,
        name: branch.name ?? '',
        address: branch.addressLine1 ?? '',
        addressLine2: branch.addressLine2,
        city: branch.city,
        region: branch.region,
        countryCode: branch.countryCode,
        postalCode: branch.postalCode,
        phone: branch.phone ?? '',
        status: existing?.status ?? 'pending',
        openTime: openDay?.openTime ?? null,
        closeTime: openDay?.closeTime ?? null,
        latitude: branch.latitude,
        longitude: branch.longitude,
        workingHours: branch.workingHours,
        isPrimary: branch.isPrimary,
        sortOrder: branch.sortOrder,
      };
      return next;
    });
  }

  if (
    input.primaryColorHex !== undefined ||
    input.secondaryColorHex !== undefined ||
    input.accentColorHex !== undefined
  ) {
    patch.brandColors = {
      ...current.brandColors,
      ...(input.primaryColorHex !== undefined ? { primary: input.primaryColorHex ?? '' } : {}),
      ...(input.secondaryColorHex !== undefined
        ? { secondary: input.secondaryColorHex ?? '' }
        : {}),
      ...(input.accentColorHex !== undefined ? { accent: input.accentColorHex ?? '' } : {}),
    };
  }

  if (input.subscriptionOfferId !== undefined) {
    patch.subscriptionOfferId = input.subscriptionOfferId;
  }
  if (input.logoAssetId !== undefined) patch.logoAssetId = input.logoAssetId;
  if (input.menuAssetId !== undefined) patch.menuAssetId = input.menuAssetId;
  if (input.agreedPrice !== undefined) patch.agreedPrice = input.agreedPrice;
  if (input.agreedCurrency !== undefined) patch.agreedCurrency = input.agreedCurrency;

  return patch;
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
    // Static tenants already carry their branches, so the onboarding lookup is not needed.
    getTenantBranches: (tenant: Tenant) => run(() => tenant.branches),
    // OPEN: endpoint missing in swagger. KPI counts, analytics charts and their refresh
    // read the static overview analysis.
    getOverviewAnalysis: () => run(() => backend.getOverviewAnalysis()),
    // Static demo keeps the same contract as the live adapter; the static tenants
    // already carry their package and duration.
    getOverviewLatestContracts: (items: Tenant[]) =>
      run<OverviewLatestContract[]>(() =>
        latestContractsByActivation(items, OVERVIEW_LATEST_CONTRACTS_COUNT).map((tenant) => ({
          tenant,
          packageCode: tenant.subscription.packageCode ?? null,
          durationMonths: tenant.subscription.durationMonths ?? null,
          contractDate: contractDate(tenant),
        })),
      ),
    getOverviewEndingSoon: (items: Tenant[]) =>
      run<OverviewEndingSoonResult>(() => ({
        entries: endingSoon(items, new Date(), OVERVIEW_ENDING_WITHIN_DAYS),
        failedCount: 0,
      })),
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
    // OPEN: endpoint missing in swagger. Activity logs keep the static source.
    listActivity: (params?: ListActivityParams) => run(() => backend.listActivity(params)),
    // OPEN: endpoint missing in swagger. Internal users.
    listAdminAccounts: () => run(() => backend.listAdminAccounts()),
    // OPEN: endpoint missing in swagger. Internal users.
    createAdminAccount: (input: CreateAdminAccountInput, actor: AdminUser) =>
      run(() => backend.createAdminAccount(input, actor)),
    // OPEN: endpoint missing in swagger. Internal users.
    changeOwnPassword: (input: ChangeOwnPasswordInput, actor: AdminUser) =>
      run(() => backend.changeOwnPassword(input, actor)),
    // OPEN: endpoint missing in swagger. Tenant accounts.
    listTenantAccounts: () => run(() => backend.listTenantAccounts()),
    // OPEN: endpoint missing in swagger. Tenant accounts.
    createTenantAccount: (input: CreateTenantAccountInput, actor: AdminUser) =>
      run(() => backend.createTenantAccount(input, actor)),
    // OPEN: endpoint missing in swagger. Tenant accounts.
    resetTenantAccountPassword: (
      input: ResetTenantAccountPasswordInput,
      actor: AdminUser,
    ) => run(() => backend.resetTenantAccountPassword(input, actor)),
    // OPEN: endpoint missing in swagger. Analytics charts.
    getMonthlySales: () => run(() => backend.getMonthlySales()),
    listApplications: () => run(() => backend.listApplications()),
    getApplication: (requestId: string) =>
      run(() => {
        const tenant = backend.getTenant(requestId);
        if (!tenant.logoUrl || tenant.logoAsset) return tenant;
        return {
          ...tenant,
          logoAsset: { assetId: tenant.logoAssetId ?? tenant.id, url: tenant.logoUrl },
        };
      }),
    // Static demo fallback; `api` mode uses PATCH /onboarding-requests/{id}.
    updateApplication: (requestId: string, input: UpdateApplicationInput, actor: AdminUser) =>
      run(() => {
        const current = backend.getTenant(requestId);
        return backend.updateApplication(
          requestId,
          applicationInputToTenantPatch(current, input),
          actor,
        );
      }),
    listOffers: () => run(() => STATIC_OFFERS),
    updateApplicationPayment: (requestId: string, paid: boolean, actor: AdminUser) =>
      run(() =>
        backend.updateApplication(
          requestId,
          { paymentStatus: paid ? 'paid' : 'unpaid' },
          actor,
        ),
      ).then(() => undefined),
    // Static demo fallback; `api` mode uses POST /onboarding-requests/{id}/approve.
    approveApplication: (tenantId: string, actor: AdminUser) =>
      run<TenantProvisioning>(async () => {
        const tenant = await backend.updateApplication(tenantId, { status: 'approved' }, actor);
        return {
          tenantId: tenant.id,
          slug: toTenantSlug(tenant.restaurantName),
          status: 'active',
          activatedAtUtc: null,
        };
      }),
    // Static demo fallback; `api` mode uses POST /onboarding-requests/{id}/reject.
    rejectApplication: (tenantId: string, _reason: string, actor: AdminUser) =>
      run(() => backend.updateApplication(tenantId, { status: 'inactive' }, actor)).then(
        () => undefined,
      ),
    // Static demo fallback; `api` mode reads /tenants/{id}/provisioning-status.
    getTenantStatus: (tenantId: string) =>
      run<TenantProvisioning>(() => ({
        tenantId,
        slug: null,
        status: 'active',
        activatedAtUtc: null,
      })),
    // Static demo fallback; `api` mode uses POST /tenants/{id}/retry.
    retryTenant: (tenantId: string) =>
      run<TenantProvisioning>(() => ({
        tenantId,
        slug: null,
        status: 'active',
        activatedAtUtc: null,
      })),
    // Static demo fallback; `api` mode uses PUT /tenants/{id}.
    updateTenant: (tenantId: string, input: UpdateTenantInput, actor: AdminUser) =>
      run(() =>
        backend.updateApplication(
          tenantId,
          {
            restaurantName: input.restaurantNameEn ?? input.restaurantNameAr ?? '',
            businessName: input.restaurantNameEn ?? input.restaurantNameAr ?? '',
            restaurantNameAr: input.restaurantNameAr,
            contact: {
              phone: input.ownerPhone ?? '',
              email: input.ownerEmail ?? '',
              name: input.ownerFullName ?? '',
            },
            slug: input.slug,
          },
          actor,
        ),
      ),
    // Static demo fallback; `api` mode uses POST /tenants/{id}/plan/activate.
    activatePlan: (tenantId: string, actor: AdminUser) =>
      run(() => {
        const tenant = backend.getTenant(tenantId);
        return backend.updateApplication(
          tenantId,
          { subscription: { ...tenant.subscription, status: 'active' } },
          actor,
        );
      }).then(() => undefined),
    // OPEN: endpoint missing in swagger. Images are kept as data URLs until an upload endpoint exists.
    uploadImage: (file: File) => uploads.uploadImage(file),
    // OPEN: menu OCR runs on the backend; the static data source has no API base URL.
    extractMenu: async (): Promise<MenuExtractionOutcome> => ({
      status: 'failed',
      errorCode: 'StaticDataSource',
      errorMessage: null,
    }),
    signIn: (email: string, password: string) =>
      run(() => backend.signIn({ email, password })),
    // Static demo has no backend to refresh against; the session ends at expiresAtUtc.
    async refreshSession(): Promise<PlatformLoginResponse> {
      throw new Error('Refresh is not available in the static data source.');
    },
    // Static demo has no server session to end.
    async logout(): Promise<void> {},
  };
}
