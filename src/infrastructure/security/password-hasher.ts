/**
 * NW-247: passwords are never stored as plain text. The mock account store hashes a
 * password before it is written and compares hashes on sign-in.
 *
 * ASSUMPTION: SHA-256 without a per-account salt is enough for this mock. A real
 * backend must use a slow key-derivation function (argon2 / bcrypt / scrypt) with a
 * unique salt per account.
 */
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
