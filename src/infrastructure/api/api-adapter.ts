import type { Api, ListTenantsParams } from '@/application/dto';
import { applyTenantQuery } from '@/application/use-cases';
import type { Tenant } from '@/domain/entities';
import { isListed } from '@/domain/rules/tenants';
import { createAuthApi } from './auth-api';
import { createOnboardingApi } from './onboarding-api';
import { mapOnboardingRequestToTenant } from './onboarding-mapping';
import type { HttpClient } from './http-client';

export interface ApiAdapterOptions {
  /** Demo implementation for the endpoints the backend does not expose yet. */
  staticApi: Api;
  client: HttpClient;
}

/**
 * API data source (agent.md section 21). Onboarding comes from the backend; delete, save,
 * approve and the accounts endpoints stay on the static adapter until the backend
 * publishes them.
 */
export function createApiAdapter({ staticApi, client }: ApiAdapterOptions): Api {
  const onboarding = createOnboardingApi(client);
  const auth = createAuthApi(client);

  /** Approved applications live here until the tenant endpoint is reconnected. */
  const approvedLocally = new Map<string, Tenant>();
  let applicationsCache: Tenant[] = [];

  async function fetchApplications(): Promise<Tenant[]> {
    const [page, offers] = await Promise.all([
      onboarding.listRequests({ page: 1, pageSize: 100 }),
      onboarding.listOffers(),
    ]);
    return page.items.map((item) => mapOnboardingRequestToTenant(item, offers));
  }

  return {
    // OPEN: endpoint missing in swagger. Delete, save changes and the accounts
    // endpoints keep using the static adapter in api mode.
    ...staticApi,

    signIn: (email, password) => auth.signIn(email, password),

    async listApplications() {
      applicationsCache = await fetchApplications();
      return applicationsCache.filter((tenant) => !approvedLocally.has(tenant.id));
    },

    listOffers: () => onboarding.listOffers(),

    async updateApplicationPayment(requestId, paid) {
      await onboarding.setPayment(requestId, paid);
    },

    // OPEN: tenant API paused, reconnect to POST /api/v1/tenants when backend is ready, see backend-api-contract.md
    async approveApplication(tenantId, _adminPassword, _actor) {
      const application = applicationsCache.find((tenant) => tenant.id === tenantId);
      if (!application) throw new Error(`Application not found: ${tenantId}`);
      const approved: Tenant = { ...application, status: 'approved' };
      approvedLocally.set(tenantId, approved);
      return approved;
    },

    async listTenants(params?: ListTenantsParams) {
      const base = await staticApi.listTenants(params);
      const local = [...approvedLocally.values()].filter(isListed);
      if (local.length === 0) return base;
      return applyTenantQuery([...base, ...local], params);
    },

    async getTenant(tenantId) {
      return approvedLocally.get(tenantId) ?? staticApi.getTenant(tenantId);
    },
  };
}
