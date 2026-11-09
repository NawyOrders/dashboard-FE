/**
 * Tenant slug generated from the English restaurant name (agent.md section 26).
 *
 * The dashboard never accepts a typed slug: the approve flow always derives it from the
 * application. Duplicate slugs are allowed (owner accepted).
 *
 * OPEN: final slug rule, preview form or backend
 */
export function toTenantSlug(nameEn: string): string {
  return nameEn
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
