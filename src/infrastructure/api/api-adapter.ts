import type { Api } from '@/application/dto';
import { makeExtractMenu } from '@/application/use-cases/extract-menu';
import type { Tenant } from '@/domain/entities';
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
 * API data source (agent.md section 21). Onboarding, tenant provisioning and the menu
 * OCR come from the backend; the accounts endpoints stay on the static adapter until
 * the backend publishes them.
 */
export function createApiAdapter({ staticApi, client }: ApiAdapterOptions): Api {
  const onboarding = createOnboardingApi(client);
  const tenants = createTenantApi(client);
  const auth = createAuthApi(client);
  const extractMenu = makeExtractMenu(createOcrApi(client));

  return {
    // OPEN: endpoint missing in swagger. Save changes and the accounts endpoints
    // keep using the static adapter in api mode.
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

    getTenantStatus: (tenantId) => tenants.getTenantStatus(tenantId),

    retryTenant: (tenantId, idempotencyKey) => tenants.retryTenant(tenantId, idempotencyKey),
  };
}
