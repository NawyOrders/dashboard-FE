import type { Api, ListTenantsParams } from '@/application/dto';
import { applyTenantQuery } from '@/application/use-cases';
import { makeExtractMenu } from '@/application/use-cases/extract-menu';
import type { Tenant, TenantListItem } from '@/domain/entities';
import { createAuthApi } from './auth-api';
import { createOcrApi } from './ocr-api';
import { createOnboardingApi } from './onboarding-api';
import { mapOnboardingRequestToTenant } from './onboarding-mapping';
import { createTenantApi } from './tenant-api';
import { mapTenantDetails, mapTenantListItem } from './tenant-mapping';
import type { HttpClient } from './http-client';

export interface ApiAdapterOptions {
  /** Demo implementation for the endpoints the backend does not expose yet. */
  staticApi: Api;
  client: HttpClient;
}

/**
 * API data source (agent.md section 21). Onboarding, tenant provisioning and the menu
 * OCR come from the backend; the accounts endpoints stay on the static adapter until
 * the backend publishes them.
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
    // OPEN: endpoint missing in swagger. Save changes and the accounts endpoints
    // keep using the static adapter in api mode.
    ...staticApi,

    signIn: (email, password) => auth.signIn(email, password),

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
