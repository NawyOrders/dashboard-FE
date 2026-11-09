import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/composition';
import type { ListActivityParams, ListTenantsParams } from '@/application/dto';
import type { AdminUser, CreateAdminAccountInput, Tenant } from '@/domain/entities';
import type { CreateTenantAccountInput, ResetTenantAccountPasswordInput } from '@/application/dto';

export const queryKeys = {
  tenants: (params: ListTenantsParams) => ['tenants', params] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  tenantBranches: (tenantId: string) => ['tenantBranches', tenantId] as const,
  overview: ['overview'] as const,
  overviewLatestContracts: (listUpdatedAt: number) =>
    ['overview', 'latestContracts', listUpdatedAt] as const,
  overviewEndingSoon: (listUpdatedAt: number) =>
    ['overview', 'endingSoon', listUpdatedAt] as const,
  activity: (params: ListActivityParams) => ['activity', params] as const,
  flags: (tenantId: string) => ['flags', tenantId] as const,
  adminAccounts: ['adminAccounts'] as const,
  tenantAccounts: ['tenantAccounts'] as const,
  monthlySales: ['monthlySales'] as const,
  applications: ['applications'] as const,
  application: (requestId: string) => ['application', requestId] as const,
  offers: ['offers'] as const,
};

export function useTenants(params: ListTenantsParams = {}) {
  return useQuery({
    queryKey: queryKeys.tenants(params),
    queryFn: () => api.listTenants(params),
  });
}

export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.tenant(tenantId),
    queryFn: () => api.getTenant(tenantId),
    enabled: Boolean(tenantId),
  });
}

/**
 * WORKAROUND: remove when TenantDetailsResponse has requestId and branches.
 * Read-only branches of an approved restaurant, found through its onboarding request.
 */
export function useTenantBranches(tenant: Tenant | undefined) {
  return useQuery({
    queryKey: queryKeys.tenantBranches(tenant?.tenantId ?? ''),
    queryFn: () => (tenant ? api.getTenantBranches(tenant) : Promise.resolve(null)),
    enabled: Boolean(tenant?.tenantId),
  });
}

export function useOverviewAnalysis() {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => api.getOverviewAnalysis(),
  });
}

/**
 * Latest contracts from the live tenant list. `listUpdatedAt` keys the query to the
 * shared `useTenants` result, so the pages are read once per screen load and the
 * details are re-read only when the list changes.
 */
export function useOverviewLatestContracts(
  tenants: Tenant[] | undefined,
  listUpdatedAt: number,
) {
  return useQuery({
    queryKey: queryKeys.overviewLatestContracts(listUpdatedAt),
    queryFn: () => api.getOverviewLatestContracts(tenants ?? []),
    enabled: Boolean(tenants),
  });
}

/**
 * Subscriptions ending within the configured window. The end date is only in the tenant
 * details (one call per tenant, cached by the adapter for the session).
 */
export function useOverviewEndingSoon(tenants: Tenant[] | undefined, listUpdatedAt: number) {
  return useQuery({
    queryKey: queryKeys.overviewEndingSoon(listUpdatedAt),
    queryFn: () => api.getOverviewEndingSoon(tenants ?? []),
    enabled: Boolean(tenants),
  });
}

export function useActivity(params: ListActivityParams = {}) {
  return useQuery({
    queryKey: queryKeys.activity(params),
    queryFn: () => api.listActivity(params),
  });
}

export function useAdminAccounts() {
  return useQuery({
    queryKey: queryKeys.adminAccounts,
    queryFn: () => api.listAdminAccounts(),
  });
}

export function useCreateAdminAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, actor }: { input: CreateAdminAccountInput; actor: AdminUser }) =>
      api.createAdminAccount(input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminAccounts });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

/** NW-247: the tenant accounts of the restaurants. */
export function useTenantAccounts() {
  return useQuery({
    queryKey: queryKeys.tenantAccounts,
    queryFn: () => api.listTenantAccounts(),
  });
}

/** NW-247: create a tenant account for one restaurant. */
export function useCreateTenantAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      actor,
    }: {
      input: CreateTenantAccountInput;
      actor: AdminUser;
    }) => api.createTenantAccount(input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenantAccounts });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

/** NW-247: reset the password of a tenant account. */
export function useResetTenantAccountPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      actor,
    }: {
      input: ResetTenantAccountPasswordInput;
      actor: AdminUser;
    }) => api.resetTenantAccountPassword(input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenantAccounts });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useFeatureFlags(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.flags(tenantId),
    queryFn: () => api.listFeatureFlags(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useMonthlySales() {
  return useQuery({
    queryKey: queryKeys.monthlySales,
    queryFn: () => api.getMonthlySales(),
  });
}

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: () => api.listApplications(),
  });
}

/** `GET /onboarding-requests/{requestId}` — the full request for the view dialog. */
export function useApplication(requestId: string | null) {
  return useQuery({
    queryKey: queryKeys.application(requestId ?? ''),
    queryFn: () => api.getApplication(requestId ?? ''),
    enabled: Boolean(requestId),
  });
}

/** `GET /offers` — the package/duration/price combinations the backend accepts. */
export function useOffers() {
  return useQuery({
    queryKey: queryKeys.offers,
    queryFn: () => api.listOffers(),
  });
}

/** `PATCH /onboarding-requests/{requestId}/payment` (agent.md section 21). */
export function useUpdateApplicationPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      paid,
      actor,
    }: {
      requestId: string;
      paid: boolean;
      actor: AdminUser;
    }) => api.updateApplicationPayment(requestId, paid, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications });
    },
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, actor }: { requestId: string; actor: AdminUser }) =>
      api.approveApplication(requestId, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      void queryClient.invalidateQueries({ queryKey: ['tenants'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      rejectionReason,
      actor,
    }: {
      requestId: string;
      rejectionReason: string;
      actor: AdminUser;
    }) => api.rejectApplication(requestId, rejectionReason, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      void queryClient.invalidateQueries({ queryKey: ['tenants'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}
