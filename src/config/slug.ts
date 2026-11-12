/**
 * Slug rules for the application preview (owner decision).
 *
 * The slug is preview-only: it is not part of the submit or PATCH bodies, so the backend
 * does not enforce these values yet.
 */

/** Minimum number of characters of a tenant slug. */
export const SLUG_MIN_LENGTH = 3;

/** Maximum number of characters of a tenant slug. */
export const SLUG_MAX_LENGTH = 30;

/** Exact values (after lowercasing) that a tenant slug cannot use. */
export const SLUG_RESERVED_WORDS = [
  'www',
  'api',
  'admin',
  'restaurant',
  'dashboard',
  'register',
] as const;
