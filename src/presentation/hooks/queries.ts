import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/composition';
import type { ListActivityParams, ListTenantsParams } from '@/application/dto';
import type { AdminUser, CreateAdminAccountInput } from '@/domain/entities';
import type { RevenuePeriodDays } from '@/domain/rules/revenue';

export const queryKeys = {
  tenants: (params: ListTenantsParams) => ['tenants', params] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  overview: ['overview'] as const,
  activity: (params: ListActivityParams) => ['activity', params] as const,
  flags: (tenantId: string) => ['flags', tenantId] as const,
  adminAccounts: ['adminAccounts'] as const,
  revenue: (periodDays: RevenuePeriodDays) => ['revenue', periodDays] as const,
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

export function useFeatureFlags(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.flags(tenantId),
    queryFn: () => api.listFeatureFlags(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useTotalRevenue(periodDays: RevenuePeriodDays) {
  return useQuery({
    queryKey: queryKeys.revenue(periodDays),
    queryFn: () => api.getTotalRevenue(periodDays),
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
    mutationFn: ({ tenantId, actor }: { tenantId: string; actor: AdminUser }) =>
      api.approveApplication(tenantId, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      void queryClient.invalidateQueries({ queryKey: ['tenants'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}
