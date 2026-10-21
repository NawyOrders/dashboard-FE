import type { Branch, Tenant } from '@/domain/entities';

/**
 * Mapping between the JSON field keys of the registration schema and the tenant (NW-246).
 *
 * The JSON is the source of truth for the form; the tenant is the stored model. This
 * module is the single place that knows how a JSON field key maps onto a tenant path.
 */

/** JSON field key → path on the tenant. */
export const SCHEMA_FIELD_TO_TENANT_PATH: Record<string, string> = {
  name: 'restaurantName',
  ownerName: 'contact.name',
  email: 'contact.email',
  phone: 'contact.phone',
  city: 'contact.city',
  description: 'description',
  coverImageUrl: 'coverImageUrl',
  logoUrl: 'logoUrl',
  primaryColor: 'brandColors.primary',
  backgroundColor: 'brandColors.secondary',
};

/** JSON `itemFields` key → path on the branch. */
export const SCHEMA_BRANCH_FIELD_TO_PATH: Record<string, string> = {
  name: 'name',
  address: 'address',
  phone: 'phone',
  openTime: 'openTime',
  closeTime: 'closeTime',
  menuImageUrl: 'menuImageUrl',
  latitude: 'latitude',
  longitude: 'longitude',
};

/** Branch fields stored as numbers. */
export const NUMERIC_BRANCH_FIELDS = new Set(['latitude', 'longitude']);

export function getPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

/** Reads a top-level JSON field value from a tenant. */
export function readSchemaField(tenant: Tenant, key: string): string {
  const path = SCHEMA_FIELD_TO_TENANT_PATH[key];
  if (!path) return '';
  const value = getPath(tenant, path);
  if (value === null || value === undefined) return '';
  return String(value);
}

/** Reads a branch `itemFields` value from a branch. */
export function readBranchField(branch: Branch, key: string): string {
  const path = SCHEMA_BRANCH_FIELD_TO_PATH[key];
  if (!path) return '';
  const value = getPath(branch, path);
  if (value === null || value === undefined) return '';
  return String(value);
}
