import { z } from 'zod';
import type {
  TenantDetails,
  TenantPage,
  TenantProvisioning,
  UpdateTenantInput,
} from '@/domain/entities';
import type { HttpClient } from './http-client';
import {
  provisioningStatusSchema,
  tenantDetailsSchema,
  tenantPageSchema,
  updateTenantRequestSchema,
} from './tenant-schemas';

/**
 * Tenant endpoints of the live backend (agent.md section 27).
 *
 * The list and details are read-only projections; `PUT` edits the names and owner data
 * before provisioning, and the provisioning endpoints report/retry the activation.
 */

const TENANTS_PATH = 'api/v1/tenants';
const noContentSchema = z.unknown();

export interface TenantApi {
  listTenants(params: { page: number; pageSize: number }): Promise<TenantPage>;
  getTenant(tenantId: string): Promise<TenantDetails>;
  updateTenant(tenantId: string, input: UpdateTenantInput): Promise<void>;
  getProvisioningStatus(tenantId: string): Promise<TenantProvisioning>;
  retryTenant(tenantId: string): Promise<void>;
  activatePlan(tenantId: string): Promise<void>;
}

export function createTenantApi(client: HttpClient): TenantApi {
  function tenantPath(tenantId: string): string {
    return `${TENANTS_PATH}/${tenantId}`;
  }

  return {
    listTenants({ page, pageSize }) {
      return client.request({
        path: TENANTS_PATH,
        query: { page, pageSize },
        schema: tenantPageSchema,
      });
    },

    getTenant(tenantId) {
      return client.request({
        path: tenantPath(tenantId),
        schema: tenantDetailsSchema,
      });
    },

    async updateTenant(tenantId, input) {
      await client.request({
        path: tenantPath(tenantId),
        method: 'PUT',
        body: updateTenantRequestSchema.parse(input),
        schema: noContentSchema,
      });
    },

    async getProvisioningStatus(tenantId) {
      const status = await client.request({
        path: `${tenantPath(tenantId)}/provisioning-status`,
        schema: provisioningStatusSchema,
      });
      return {
        tenantId: status.tenantId,
        slug: null,
        status: status.status,
        activatedAtUtc: status.activatedAtUtc,
      };
    },

    async retryTenant(tenantId) {
      await client.request({
        path: `${tenantPath(tenantId)}/retry`,
        method: 'POST',
        schema: noContentSchema,
      });
    },

    async activatePlan(tenantId) {
      await client.request({
        path: `${tenantPath(tenantId)}/plan/activate`,
        method: 'POST',
        schema: noContentSchema,
      });
    },
  };
}
