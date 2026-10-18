import type { Tenant } from '@/domain/entities';

/**
 * A tenant is listed in the directory / Overview once it is no longer waiting for
 * approval. `pending_approval` applications are managed exclusively on the
 * Applications page until approved. (AH-239)
 */
export function isListed(tenant: Tenant): boolean {
  return tenant.status !== 'pending_approval';
}
