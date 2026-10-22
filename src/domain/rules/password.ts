/**
 * NW-247: the password policy of the platform. One rule set for every password in the
 * product — the restaurant admin password set when an application is approved, the
 * password of a dashboard user and the password of a tenant account.
 *
 * ASSUMPTION: the owner did not define a password policy. 8 characters with at least
 * one letter and one digit is the platform default used here.
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MESSAGES = {
  tooShort: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
  needsLetter: 'Password must contain at least one letter.',
  needsDigit: 'Password must contain at least one digit.',
} as const;

/**
 * Returns `null` when the password satisfies the policy, or the user-facing message
 * when it does not. An empty value is "required", not a policy problem.
 */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return PASSWORD_MESSAGES.tooShort;
  if (!/\p{L}/u.test(password)) return PASSWORD_MESSAGES.needsLetter;
  if (!/\d/.test(password)) return PASSWORD_MESSAGES.needsDigit;
  return null;
}
