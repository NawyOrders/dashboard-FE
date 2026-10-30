import { z } from 'zod';
import type { Api, ListTenantsParams } from '@/application/dto';
import { applyTenantQuery } from '@/application/use-cases';
import { makeExtractMenu } from '@/application/use-cases/extract-menu';
import type { PlatformLoginResponse, Tenant, TenantListItem } from '@/domain/entities';
import { createAuthApi, toPlatformSession } from './auth-api';
import { loginResponseSchema } from './auth-schemas';
import { createOcrApi } from './ocr-api';
import { createOnboardingApi } from './onboarding-api';
import { mapOnboardingDetailsToTenant, mapOnboardingRequestToTenant } from './onboarding-mapping';
import { createTenantApi } from './tenant-api';
import { mapTenantDetails, mapTenantListItem } from './tenant-mapping';
import type { HttpClient } from './http-client';

export interface ApiAdapterOptions {
  /** Demo implementation for the endpoints the backend does not expose yet. */
  staticApi: Api;
  client: HttpClient;
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

    async getTenant(tenantId): Promise<Tenant> {
      return mapTenantDetails(await tenants.getTenant(tenantId));
    },

    async updateTenant(tenantId, input) {
      await tenants.updateTenant(tenantId, input);
      return mapTenantDetails(await tenants.getTenant(tenantId));
    },

    async activatePlan(tenantId) {
      await tenants.activatePlan(tenantId);
    },

    async listApplications(): Promise<Tenant[]> {
      const [page, offers] = await Promise.all([
        onboarding.listRequests({ page: 1, pageSize: 100 }),
        onboarding.listOffers(),
      ]);
      return page.items.map((item) => mapOnboardingRequestToTenant(item, offers));
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
