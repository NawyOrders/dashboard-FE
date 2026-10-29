/**
 * Text validation rules for the Create Restaurant and Branch forms.
 *
 * Single source of truth for the rules in `bugs.md` → "Validation rules to implement".
 * Pure functions: no React, no framework imports. UI schemas (zod) and use cases consume
 * these validators; the UI only renders the returned messages.
 *
 * Contract: each validator returns `null` when the value is valid, or the exact
 * user-facing message when it is not. Empty values return `null` — "required" is a
 * separate concern handled by the form schema.
 */

import { en } from '@/i18n';

// letters (any script) + digits + space + hyphen + apostrophe
const NAME_ALLOWED = /^[\p{L}\p{N} \-']+$/u;
const HAS_LETTER = /\p{L}/u;

export type NameKind = 'business' | 'restaurant' | 'branch';

/**
 * ASSUMPTION: Egyptian mobile rule, temporary, owner will revisit. Source JSON still says 7-15 digits
 *
 * Every phone field accepts only an Egyptian mobile number: exactly 11 digits starting
 * with 010, 011, 012 or 015. Spaces and dashes are ignored before the check.
 */
export const EGYPTIAN_MOBILE_PATTERN = /^01[0125][0-9]{8}$/;

function invalidNameMessage(kind: NameKind): string {
  if (kind === 'restaurant') return en.validation.restaurantNameInvalid;
  if (kind === 'branch') return en.validation.branchNameInvalid;
  return en.validation.businessNameInvalid;
}

function numericNameMessage(kind: NameKind): string {
  if (kind === 'restaurant') return en.validation.restaurantNameNumeric;
  return kind === 'branch'
    ? en.validation.branchNameNumeric
    : en.validation.businessNameNumeric;
}

/**
 * Letters (any script), digits, spaces, `-`, `'`; must contain at least one letter and
 * cannot be entirely numeric. (BUG-001..004, BUG-013, BUG-014)
 */
export function validateName(value: string, kind: NameKind): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (!NAME_ALLOWED.test(trimmed)) return invalidNameMessage(kind);
  if (!HAS_LETTER.test(trimmed)) return numericNameMessage(kind);
  return null;
}

/**
 * Egyptian mobile rule (NW-247). Spaces and dashes are ignored; empty values return
 * `null` because "required" is handled by the form schema.
 */
export function validatePhone(value: string): string | null {
  const normalized = value.replace(/[\s-]/g, '');
  if (normalized.length === 0) return null;
  return EGYPTIAN_MOBILE_PATTERN.test(normalized) ? null : en.validation.egyptianMobile;
}

// local part: letters, digits, `.`, `_`, `%`, `+`, `-`, `'`
const EMAIL_LOCAL_ALLOWED = /^[A-Za-z0-9._%+'-]+$/;
// one or more dot-separated labels; labels use letters/digits/hyphens and cannot
// start or end with a hyphen
const EMAIL_DOMAIN_ALLOWED =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const EMAIL_DISALLOWED_SYMBOLS = /[^A-Za-z0-9._%+'-@]/;
const EMAIL_DOMAIN_DISALLOWED = /[^A-Za-z0-9.-]/;

/**
 * Standard email rules (BUG-009..011, BUG-015, BUG-016).
 * Exactly one `@`; local part letters/digits/`.`/`_`/`%`/`+`/`-`/`'`; domain labels
 * letters/digits/hyphens; TLD of at least 2 letters.
 */
export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    if (EMAIL_DISALLOWED_SYMBOLS.test(trimmed)) return en.validation.emailSymbols;
    if (/^\d+$/.test(trimmed)) return en.validation.emailInvalidFormat;
    return en.validation.emailNoDomain;
  }

  const [local, domain] = parts as [string, string];
  if (!EMAIL_LOCAL_ALLOWED.test(local) || EMAIL_DOMAIN_DISALLOWED.test(domain)) {
    return en.validation.emailSymbols;
  }
  if (local.length === 0 || !EMAIL_DOMAIN_ALLOWED.test(domain)) {
    return en.validation.emailIncompleteDomain;
  }

  const tld = domain.split('.').pop() ?? '';
  if (!/^[A-Za-z]{2,}$/.test(tld)) return en.validation.emailIncompleteDomain;

  return null;
}
