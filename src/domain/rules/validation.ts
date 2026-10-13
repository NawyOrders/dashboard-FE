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

// letters (any script) + digits + space + hyphen + apostrophe
const NAME_ALLOWED = /^[\p{L}\p{N} \-']+$/u;
const HAS_LETTER = /\p{L}/u;
const HAS_LETTER_ANYWHERE = /\p{L}/u;

export type NameKind = 'business' | 'restaurant' | 'branch';
export type PhoneKind = 'phone' | 'branchPhone';

export const MIN_PHONE_DIGITS = 7;
export const MAX_PHONE_DIGITS = 15;

export const VALIDATION_MESSAGES = {
  businessNameInvalid:
    "Business name can only contain letters, numbers, spaces, hyphens (-), and apostrophes (').",
  businessNameNumeric:
    'Business name must contain at least one letter and cannot consist solely of numbers.',
  restaurantNameInvalid:
    "Restaurant name contains invalid characters. Only letters, numbers, spaces, hyphens (-), and apostrophes (') are allowed.",
  restaurantNameNumeric:
    'Restaurant name must include valid alphabetic characters and cannot be entirely numeric.',
  branchNameInvalid:
    "Branch name can only contain letters, numbers, spaces, hyphens (-), and apostrophes (').",
  branchNameNumeric:
    'Branch name must contain at least one letter and cannot consist solely of numbers.',
  phoneLetters:
    'Please enter a valid phone number containing digits only (optional leading + allowed).',
  phoneSymbols: 'Invalid phone number. Symbols and special characters are not allowed.',
  phoneFormat: 'Please enter a valid phone number format (e.g., +201012345678 or 01012345678).',
  phoneTooShort:
    'Phone number is too short. Please enter a valid phone number (minimum 7–10 digits).',
  branchPhoneLetters: 'Branch phone number must contain digits only (optional leading + allowed).',
  branchPhoneSymbols: 'Invalid phone number. Symbols and special characters are not allowed.',
  branchPhoneFormat:
    'Please enter a valid phone number format (e.g., +201012345678 or 01012345678).',
  branchPhoneTooShort:
    'Branch phone number is too short. Please enter a valid number (minimum 7–10 digits).',
  emailInvalidFormat:
    'Invalid email format. Please enter a valid email address (e.g., user@example.com).',
  emailSymbols:
    'Please enter a valid email address. Special characters (@#$%^&) are not allowed in this format.',
  emailNoDomain: 'Please enter a valid email address (e.g., name@domain.com).',
  emailIncompleteDomain:
    'Please enter a valid email address with a complete domain (e.g., name@example.com).',
} as const;

function invalidNameMessage(kind: NameKind): string {
  if (kind === 'restaurant') return VALIDATION_MESSAGES.restaurantNameInvalid;
  if (kind === 'branch') return VALIDATION_MESSAGES.branchNameInvalid;
  return VALIDATION_MESSAGES.businessNameInvalid;
}

function numericNameMessage(kind: NameKind): string {
  if (kind === 'restaurant') return VALIDATION_MESSAGES.restaurantNameNumeric;
  return kind === 'branch'
    ? VALIDATION_MESSAGES.branchNameNumeric
    : VALIDATION_MESSAGES.businessNameNumeric;
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
 * Optional single leading `+`, then digits only; 7–15 digits total.
 * (BUG-005..008, BUG-017..020)
 */
export function validatePhone(value: string, kind: PhoneKind): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  if (HAS_LETTER_ANYWHERE.test(trimmed)) {
    return kind === 'phone'
      ? VALIDATION_MESSAGES.phoneLetters
      : VALIDATION_MESSAGES.branchPhoneLetters;
  }

  const digits = trimmed.startsWith('+') ? trimmed.slice(1) : trimmed;
  if (!/^\d+$/.test(digits)) {
    return kind === 'phone'
      ? VALIDATION_MESSAGES.phoneSymbols
      : VALIDATION_MESSAGES.branchPhoneSymbols;
  }

  if (digits.length < MIN_PHONE_DIGITS) {
    return kind === 'phone'
      ? VALIDATION_MESSAGES.phoneTooShort
      : VALIDATION_MESSAGES.branchPhoneTooShort;
  }
  if (digits.length > MAX_PHONE_DIGITS) {
    return kind === 'phone' ? VALIDATION_MESSAGES.phoneFormat : VALIDATION_MESSAGES.branchPhoneFormat;
  }
  return null;
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
    if (EMAIL_DISALLOWED_SYMBOLS.test(trimmed)) return VALIDATION_MESSAGES.emailSymbols;
    if (/^\d+$/.test(trimmed)) return VALIDATION_MESSAGES.emailInvalidFormat;
    return VALIDATION_MESSAGES.emailNoDomain;
  }

  const [local, domain] = parts as [string, string];
  if (!EMAIL_LOCAL_ALLOWED.test(local) || EMAIL_DOMAIN_DISALLOWED.test(domain)) {
    return VALIDATION_MESSAGES.emailSymbols;
  }
  if (local.length === 0 || !EMAIL_DOMAIN_ALLOWED.test(domain)) {
    return VALIDATION_MESSAGES.emailIncompleteDomain;
  }

  const tld = domain.split('.').pop() ?? '';
  if (!/^[A-Za-z]{2,}$/.test(tld)) return VALIDATION_MESSAGES.emailIncompleteDomain;

  return null;
}
