import type { Api } from '@/application/dto';
import { makeExtractMenu } from '@/application/use-cases/extract-menu';
import type { Tenant } from '@/domain/entities';
import { buildCreateTenantRequest } from '@/domain/rules/tenant-create';
import { createAuthApi } from './auth-api';
import { createOcrApi } from './ocr-api';
import { createOnboardingApi } from './onboarding-api';
import { mapOnboardingRequestToTenant } from './onboarding-mapping';
import { createTenantApi } from './tenant-api';
import type { HttpClient } from './http-client';

export interface ApiAdapterOptions {
  /** Demo implementation for the endpoints the backend does not expose yet. */
  staticApi: Api;
  client: HttpClient;
}

/**
 * API data source (agent.md section 21). Onboarding and tenant provisioning come from
 * the backend; delete, save changes and the accounts endpoints stay on the static
 * adapter until the backend publishes them.
 */
export function createApiAdapter({ staticApi, client }: ApiAdapterOptions): Api {
  const onboarding = createOnboardingApi(client);
  const tenants = createTenantApi(client);
  const auth = createAuthApi(client);
  const extractMenu = makeExtractMenu(createOcrApi(client));

  return {
    // OPEN: endpoint missing in swagger. Delete, save changes and the accounts
    // endpoints keep using the static adapter in api mode.
    ...staticApi,

    signIn: (email, password) => auth.signIn(email, password),

    extractMenu: (file, options) => extractMenu(file, options),

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

    // OPEN: send start date to backend when approve accepts it
    async approveApplication(tenantId, adminPassword, _actor, _subscriptionStartDate, idempotencyKey) {
      const page = await onboarding.listRequests({ page: 1, pageSize: 100 });
      const request = page.items.find((item) => item.requestId === tenantId);
      if (!request) throw new Error(`Onboarding request not found: ${tenantId}`);
      return tenants.createTenant(
        buildCreateTenantRequest(request, adminPassword),
        idempotencyKey,
      );
    },

    getTenantStatus: (tenantId) => tenants.getTenantStatus(tenantId),

    retryTenant: (tenantId, idempotencyKey) => tenants.retryTenant(tenantId, idempotencyKey),
  };
}
