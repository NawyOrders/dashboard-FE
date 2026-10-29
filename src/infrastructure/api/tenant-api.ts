import type { CreateTenantRequest, TenantProvisioning } from '@/domain/entities';
import type { HttpClient } from './http-client';
import { createTenantRequestSchema, tenantProvisioningResponseSchema } from './tenant-schemas';

/**
 * Tenant provisioning client (agent.md section 26).
 *
 * Approve is not a separate endpoint: `POST /api/v1/tenants` creates the tenant, then the
 * status endpoint reports provisioning until it reaches a final value.
 */

const TENANTS_PATH = 'api/v1/tenants';

export interface TenantApi {
  createTenant(body: CreateTenantRequest, idempotencyKey: string): Promise<TenantProvisioning>;
  getTenantStatus(tenantId: string): Promise<TenantProvisioning>;
  retryTenant(tenantId: string, idempotencyKey: string): Promise<TenantProvisioning>;
}

export function createTenantApi(client: HttpClient): TenantApi {
  function statusPath(tenantId: string): string {
    return `${TENANTS_PATH}/${tenantId}`;
  }

  return {
    createTenant(body, idempotencyKey) {
      return client.request({
        path: TENANTS_PATH,
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: createTenantRequestSchema.parse(body),
        schema: tenantProvisioningResponseSchema,
        expectedStatus: 202,
      });
    },

    getTenantStatus(tenantId) {
      return client.request({
        path: statusPath(tenantId),
        schema: tenantProvisioningResponseSchema,
      });
    },

    retryTenant(tenantId, idempotencyKey) {
      return client.request({
        path: `${statusPath(tenantId)}/retry`,
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        schema: tenantProvisioningResponseSchema,
        expectedStatus: 202,
      });
    },
  };
}
