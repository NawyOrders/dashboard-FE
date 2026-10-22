import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/composition';
import type { ListActivityParams, ListTenantsParams } from '@/application/dto';
import type { AdminUser, CreateAdminAccountInput } from '@/domain/entities';
import type { CreateTenantAccountInput, ResetTenantAccountPasswordInput } from '@/application/dto';

export const queryKeys = {
  tenants: (params: ListTenantsParams) => ['tenants', params] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  overview: ['overview'] as const,
  activity: (params: ListActivityParams) => ['activity', params] as const,
  flags: (tenantId: string) => ['flags', tenantId] as const,
  adminAccounts: ['adminAccounts'] as const,
  tenantAccounts: ['tenantAccounts'] as const,
  monthlySales: ['monthlySales'] as const,
  applications: ['applications'] as const,
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

export function useOverviewAnalysis() {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => api.getOverviewAnalysis(),
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

export function useApproveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tenantId,
      adminPassword,
      actor,
    }: {
      tenantId: string;
      adminPassword: string;
      actor: AdminUser;
    }) => api.approveApplication(tenantId, adminPassword, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      void queryClient.invalidateQueries({ queryKey: ['tenants'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}
