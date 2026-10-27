import type { Api } from '@/application/dto';
import { buildCreateTenantRequest } from '@/domain/rules/tenant-create';
import { createAuthApi } from './auth-api';
import { createOnboardingApi } from './onboarding-api';
import { createTenantApi } from './tenant-api';
import { mapOnboardingRequestToTenant } from './onboarding-mapping';
import type { HttpClient } from './http-client';

export interface ApiAdapterOptions {
  /** Demo implementation for the endpoints the backend does not expose yet. */
  staticApi: Api;
  client: HttpClient;
}

/**
 * API data source (agent.md section 21). Onboarding and tenant provisioning come from
 * the backend; delete, save and the accounts endpoints stay on the static adapter until
 * the backend publishes them.
 */
export function createApiAdapter({ staticApi, client }: ApiAdapterOptions): Api {
  const onboarding = createOnboardingApi(client);
  const tenants = createTenantApi(client);
  const auth = createAuthApi(client);

  return {
    // OPEN: endpoint missing in swagger. Delete, save changes and the accounts
    // endpoints keep using the static adapter in api mode.
    ...staticApi,

    signIn: (email, password) => auth.signIn(email, password),

    async listApplications() {
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

    async approveApplication(requestId, adminPassword, _actor, idempotencyKey) {
      const page = await onboarding.listRequests({ page: 1, pageSize: 100 });
      const request = page.items.find((item) => item.requestId === requestId);
      if (!request) throw new Error(`Onboarding request not found: ${requestId}`);
      return tenants.createTenant(
        buildCreateTenantRequest(request, adminPassword),
        idempotencyKey,
      );
    },

    getTenantStatus: (tenantId) => tenants.getTenantStatus(tenantId),
    retryTenant: (tenantId, idempotencyKey) => tenants.retryTenant(tenantId, idempotencyKey),
  };
}
