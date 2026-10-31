import { z } from 'zod';
import type {
  Api,
  ListTenantsParams,
  OverviewEndingSoonResult,
  OverviewLatestContract,
} from '@/application/dto';
import { applyTenantQuery } from '@/application/use-cases';
import { makeExtractMenu } from '@/application/use-cases/extract-menu';
import {
  OVERVIEW_ENDING_WITHIN_DAYS,
  OVERVIEW_LATEST_CONTRACTS_COUNT,
} from '@/config/policy';
import {
  contractDate,
  endingSoon,
  latestContractsByActivation,
} from '@/domain/rules/overview';
import type {
  Branch,
  OnboardingRequestListItem,
  PlatformLoginResponse,
  Tenant,
  TenantDetails,
  TenantListItem,
} from '@/domain/entities';
import { createAuthApi, toPlatformSession } from './auth-api';
import { loginResponseSchema } from './auth-schemas';
import { createOcrApi } from './ocr-api';
import { createOnboardingApi } from './onboarding-api';
import {
  mapOnboardingBranchToBranch,
  mapOnboardingDetailsToTenant,
  mapOnboardingRequestToTenant,
} from './onboarding-mapping';
import { createTenantApi } from './tenant-api';
import {
  durationFromApi,
  mapTenantDetails,
  mapTenantListItem,
  packageCodeFromApi,
} from './tenant-mapping';
import type { HttpClient } from './http-client';

export interface ApiAdapterOptions {
  /** Demo implementation for the endpoints the backend does not expose yet. */
  staticApi: Api;
  client: HttpClient;
}

/** Runs `map` over `items` with at most `limit` requests in flight. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  map: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await map(items[index]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

/** "Clearly inactive" plans are not worth a details call for the ending-soon window. */
function isClearlyInactivePlan(status: string | null | undefined): boolean {
  return /inactive|deactivat|suspend|cancel/.test((status ?? '').toLowerCase());
}

/**
 * API data source (agent.md section 21). Applications, offers, the tenants list and
 * details, provisioning status, retry, plan activation, session refresh and the menu OCR
 * come from the backend. The screens below have no endpoint in the swagger and keep the
 * static adapter: internal users, tenant accounts, roles, activity logs, analytics charts
 * and KPI counts.
 */
export function createApiAdapter({ staticApi, client }: ApiAdapterOptions): Api {
  const onboarding = createOnboardingApi(client);
  const tenants = createTenantApi(client);
  const auth = createAuthApi(client);
  const extractMenu = makeExtractMenu(createOcrApi(client));

  const TENANT_PAGE_SIZE = 100;
  const ONBOARDING_PAGE_SIZE = 100;

  // WORKAROUND: per-tenant details for end dates; remove when TenantListItemResponse has
  // plan end date. Successful details are kept in memory for the session, failed ones are
  // dropped so a retry can read them again. The semaphore caps ALL details requests,
  // including the latest-contracts and ending-soon queries running at the same time.
  const MAX_CONCURRENT_DETAILS = 5;
  const tenantDetailsCache = new Map<string, Promise<TenantDetails>>();
  const detailWaiters: Array<() => void> = [];
  let activeDetailRequests = 0;

  async function acquireDetailSlot(): Promise<void> {
    while (activeDetailRequests >= MAX_CONCURRENT_DETAILS) {
      await new Promise<void>((resolve) => detailWaiters.push(resolve));
    }
    activeDetailRequests += 1;
  }

  function releaseDetailSlot(): void {
    activeDetailRequests -= 1;
    detailWaiters.shift()?.();
  }

  function readTenantDetails(tenantId: string): Promise<TenantDetails> {
    const cached = tenantDetailsCache.get(tenantId);
    if (cached) return cached;
    const request = (async () => {
      await acquireDetailSlot();
      try {
        return await tenants.getTenant(tenantId);
      } finally {
        releaseDetailSlot();
      }
    })().catch((error: unknown) => {
      tenantDetailsCache.delete(tenantId);
      throw error;
    });
    tenantDetailsCache.set(tenantId, request);
    return request;
  }

  async function readAllTenants(): Promise<TenantListItem[]> {
    const first = await tenants.listTenants({ page: 1, pageSize: TENANT_PAGE_SIZE });
    const items = [...first.items];
    if (first.hasNextPage || first.totalPages > 1) {
      const pages = Array.from(
        { length: Math.max(0, first.totalPages - 1) },
        (_, index) => index + 2,
      );
      const rest = await Promise.all(
        pages.map((page) => tenants.listTenants({ page, pageSize: TENANT_PAGE_SIZE })),
      );
      for (const page of rest) items.push(...page.items);
    }
    return items;
  }

  // WORKAROUND: remove when TenantDetailsResponse has requestId and branches.
  async function loadAllOnboardingRequests(): Promise<OnboardingRequestListItem[]> {
    const first = await onboarding.listRequests({ page: 1, pageSize: ONBOARDING_PAGE_SIZE });
    const items = [...first.items];
    if (first.hasNextPage || first.totalPages > 1) {
      const pages = Array.from(
        { length: Math.max(0, first.totalPages - 1) },
        (_, index) => index + 2,
      );
      const rest = await Promise.all(
        pages.map((page) => onboarding.listRequests({ page, pageSize: ONBOARDING_PAGE_SIZE })),
      );
      for (const page of rest) items.push(...page.items);
    }
    return items;
  }

  // WORKAROUND: remove when TenantDetailsResponse has requestId and branches.
  /** One scan per screen session; a failed scan is not cached so the next tab visit retries. */
  let onboardingListCache: Promise<OnboardingRequestListItem[]> | null = null;

  function readAllOnboardingRequests(): Promise<OnboardingRequestListItem[]> {
    if (!onboardingListCache) {
      onboardingListCache = loadAllOnboardingRequests().catch((error: unknown) => {
        onboardingListCache = null;
        throw error;
      });
    }
    return onboardingListCache;
  }

  // WORKAROUND: remove when TenantDetailsResponse has requestId and branches.
  function normalizeMatch(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  // WORKAROUND: remove when TenantDetailsResponse has requestId and branches.
  /** Several names/email matches can exist, so the one closest to the tenant creation wins. */
  function pickClosestRequest(
    requests: OnboardingRequestListItem[],
    createdAt: string,
  ): OnboardingRequestListItem | null {
    const target = new Date(createdAt).getTime();
    let closest: OnboardingRequestListItem | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const request of requests) {
      const submitted = new Date(request.submittedAtUtc).getTime();
      const distance =
        Number.isNaN(target) || Number.isNaN(submitted)
          ? Number.POSITIVE_INFINITY
          : Math.abs(submitted - target);
      if (closest === null || distance < closestDistance) {
        closest = request;
        closestDistance = distance;
      }
    }
    return closest;
  }

  return {
    // OPEN: endpoint missing in swagger. Internal users, tenant accounts, roles,
    // activity logs, analytics charts and KPI counts keep the static adapter.
    ...staticApi,

    signIn: (email, password) => auth.signIn(email, password),

    async refreshSession(refreshToken: string): Promise<PlatformLoginResponse> {
      const response = await client.request({
        path: 'api/v1/auth/refresh-token',
        method: 'POST',
        body: { refreshToken },
        schema: loginResponseSchema,
        skipAuthRetry: true,
      });
      return toPlatformSession(response);
    },

    async logout(refreshToken: string): Promise<void> {
      await client.request({
        path: 'api/v1/auth/logout',
        method: 'POST',
        body: { refreshToken },
        schema: z.unknown(),
        skipAuthRetry: true,
      });
    },

    extractMenu: (file, options) => extractMenu(file, options),

    // OPEN: GET /tenants has no search or filter parameters; they run on the client.
    async listTenants(params?: ListTenantsParams): Promise<Tenant[]> {
      const items = await readAllTenants();
      return applyTenantQuery(items.map(mapTenantListItem), params);
    },

    // The list is read once by `listTenants`; this method only asks for the plan details
    // of the selected tenants. A failed details call leaves the package/duration empty,
    // which the table renders as a dash.
    async getOverviewLatestContracts(items): Promise<OverviewLatestContract[]> {
      const latest = latestContractsByActivation(items, OVERVIEW_LATEST_CONTRACTS_COUNT);
      const details = await mapWithConcurrency(latest, 5, async (tenant) => {
        try {
          return await readTenantDetails(tenant.tenantId);
        } catch {
          return null;
        }
      });

      return latest.map((tenant, index): OverviewLatestContract => {
        const detail = details[index] ?? null;
        return {
          tenant: detail ? mapTenantDetails(detail) : tenant,
          packageCode: detail?.plan?.packageCode
            ? packageCodeFromApi(detail.plan.packageCode)
            : null,
          durationMonths: detail?.plan ? durationFromApi(detail.plan.durationMonths) : null,
          contractDate: contractDate(tenant),
        };
      });
    },

    // WORKAROUND: per-tenant details for end dates; remove when TenantListItemResponse
    // has plan end date. The list only carries `planStatus`, so each candidate costs one
    // details call (at most 5 in flight). A failed lookup is skipped and counted.
    async getOverviewEndingSoon(items): Promise<OverviewEndingSoonResult> {
      const candidates = items.filter((tenant) => !isClearlyInactivePlan(tenant.planStatus));
      const details = await mapWithConcurrency(candidates, 5, async (tenant) => {
        try {
          return await readTenantDetails(tenant.tenantId);
        } catch {
          return null;
        }
      });

      let failedCount = 0;
      const withEndDate: Tenant[] = [];
      details.forEach((detail) => {
        if (!detail) {
          failedCount += 1;
          return;
        }
        if (!detail.plan?.endsAtUtc) return;
        withEndDate.push(mapTenantDetails(detail));
      });

      return {
        entries: endingSoon(withEndDate, new Date(), OVERVIEW_ENDING_WITHIN_DAYS),
        failedCount,
      };
    },

    async getTenant(tenantId): Promise<Tenant> {
      return mapTenantDetails(await tenants.getTenant(tenantId));
    },

    // WORKAROUND: remove when TenantDetailsResponse has requestId and branches. The tenant
    // endpoints do not return branches, so they are read from the onboarding request that
    // matches the tenant on owner email and both restaurant names.
    async getTenantBranches(tenant: Tenant): Promise<Branch[] | null> {
      const requests = await readAllOnboardingRequests();
      const ownerEmail = normalizeMatch(tenant.contact.email);
      const restaurantNameEn = normalizeMatch(tenant.restaurantName);
      const restaurantNameAr = normalizeMatch(tenant.restaurantNameAr);

      const matches = requests.filter(
        (request) =>
          normalizeMatch(request.ownerEmail) === ownerEmail &&
          normalizeMatch(request.restaurantNameEn) === restaurantNameEn &&
          normalizeMatch(request.restaurantNameAr) === restaurantNameAr,
      );
      if (matches.length === 0) return null;

      const request = pickClosestRequest(matches, tenant.createdAt);
      if (!request) return null;
      const details = await onboarding.getRequest(request.requestId);
      return details.branches.map((branch, index) =>
        mapOnboardingBranchToBranch(branch, details.requestId, index),
      );
    },

    async updateTenant(tenantId, input) {
      await tenants.updateTenant(tenantId, input);
      tenantDetailsCache.delete(tenantId);
      return mapTenantDetails(await tenants.getTenant(tenantId));
    },

    async activatePlan(tenantId) {
      await tenants.activatePlan(tenantId);
      tenantDetailsCache.delete(tenantId);
    },

    // OPEN: the onboarding list has no status filter parameter, so pending requests
    // (status 1) are filtered on the client.
    async listApplications(): Promise<Tenant[]> {
      const [page, offers] = await Promise.all([
        onboarding.listRequests({ page: 1, pageSize: 100 }),
        onboarding.listOffers(),
      ]);
      return page.items
        .filter((item) => item.status === 1)
        .map((item) => mapOnboardingRequestToTenant(item, offers));
    },

    async getApplication(requestId) {
      return mapOnboardingDetailsToTenant(await onboarding.getRequest(requestId));
    },

    async updateApplication(requestId, input) {
      return mapOnboardingDetailsToTenant(await onboarding.updateRequest(requestId, input));
    },

    listOffers: () => onboarding.listOffers(),

    async updateApplicationPayment(requestId, paid) {
      await onboarding.setPayment(requestId, paid);
    },

    // OPEN: admin password has no field in approve, backend to confirm.
    async approveApplication(requestId) {
      const response = await onboarding.approveRequest(requestId);
      // OPEN: status values from backend (the approve response does not name them).
      // The dialog reads the named status from the provisioning-status endpoint.
      return {
        tenantId: response.tenantId,
        slug: response.tenantSlug,
        status: 'provisioning',
        activatedAtUtc: null,
      };
    },

    async rejectApplication(requestId, rejectionReason) {
      await onboarding.rejectRequest(requestId, rejectionReason);
    },

    getTenantStatus: (tenantId) => tenants.getProvisioningStatus(tenantId),

    async retryTenant(tenantId, _idempotencyKey) {
      await tenants.retryTenant(tenantId);
      return tenants.getProvisioningStatus(tenantId);
    },
  };
}
