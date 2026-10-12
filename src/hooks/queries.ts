import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';
import type { ListActivityParams, ListTenantsParams } from '@/services/api';

export const queryKeys = {
  tenants: (params: ListTenantsParams) => ['tenants', params] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  packages: ['packages'] as const,
  activity: (params: ListActivityParams) => ['activity', params] as const,
  flags: (tenantId: string) => ['flags', tenantId] as const,
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

export function usePackages() {
  return useQuery({
    queryKey: queryKeys.packages,
    queryFn: () => api.listPackages(),
    staleTime: Infinity,
  });
}

export function useActivity(params: ListActivityParams = {}) {
  return useQuery({
    queryKey: queryKeys.activity(params),
    queryFn: () => api.listActivity(params),
  });
}

export function useFeatureFlags(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.flags(tenantId),
    queryFn: () => api.listFeatureFlags(tenantId),
    enabled: Boolean(tenantId),
  });
}