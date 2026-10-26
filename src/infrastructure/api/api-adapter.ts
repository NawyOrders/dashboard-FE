import type { Api } from '@/application/dto';
import { createOnboardingApi } from './onboarding-api';
import { mapOnboardingRequestToTenant } from './onboarding-mapping';
import type { HttpClient } from './http-client';

export interface ApiAdapterOptions {
  /** Demo implementation for the endpoints the backend does not expose yet. */
  staticApi: Api;
  client: HttpClient;
}

/**
 * API data source (agent.md section 21). Onboarding comes from the backend; approve,
 * delete, save and the accounts endpoints stay on the static adapter until the backend
 * publishes them.
 */
export function createApiAdapter({ staticApi, client }: ApiAdapterOptions): Api {
  const onboarding = createOnboardingApi(client);

  return {
    ...staticApi,

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
  };
}
