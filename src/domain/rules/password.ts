/**
 * NW-247: the password policy of the platform. One rule set for every password in the
 * product — the restaurant admin password set when an application is approved, the
 * password of a dashboard user and the password of a tenant account.
 *
 * ASSUMPTION: the owner did not define a password policy. 8 characters with at least
 * one letter and one digit is the platform default used here.
 */
import { en } from '@/i18n';

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Returns `null` when the password satisfies the policy, or the user-facing message
 * when it does not. An empty value is "required", not a policy problem.
 */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return en.passwordPolicy.tooShort(PASSWORD_MIN_LENGTH);
  }
  if (!/\p{L}/u.test(password)) return en.passwordPolicy.needsLetter;
  if (!/\d/.test(password)) return en.passwordPolicy.needsDigit;
  return null;
}
