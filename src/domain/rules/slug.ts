import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_RESERVED_WORDS } from '@/config/slug';

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

export type SlugProblem =
  | 'required'
  | 'too-short'
  | 'too-long'
  | 'space'
  | 'invalid-characters'
  | 'edge-hyphen'
  | 'reserved';

const SLUG_ALLOWED = /^[a-z0-9-]+$/;

/**
 * Checks the typed slug (owner decision). The value is expected to be lowercased already;
 * uppercase is reported as invalid characters. Returns a problem code so the UI renders
 * the message in the current language.
 */
export function validateTenantSlug(value: string): SlugProblem | null {
  if (value.length === 0) return 'required';
  if (/\s/.test(value)) return 'space';
  if (value.length < SLUG_MIN_LENGTH) return 'too-short';
  if (value.length > SLUG_MAX_LENGTH) return 'too-long';
  if (!SLUG_ALLOWED.test(value)) return 'invalid-characters';
  if (value.startsWith('-') || value.endsWith('-')) return 'edge-hyphen';
  if ((SLUG_RESERVED_WORDS as readonly string[]).includes(value)) return 'reserved';
  return null;
}
