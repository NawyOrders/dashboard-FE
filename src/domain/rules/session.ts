/** Proactive refresh timing (agent.md section 28). */
export const REFRESH_LEAD_TIME_MS = 90_000;

/**
 * Delay before the proactive refresh, 90 seconds ahead of `expiresAtUtc`.
 * Returns 0 when that moment has already passed, null for an unparsable timestamp.
 */
export function refreshDelayMs(expiresAtUtc: string, now = Date.now()): number | null {
  const expiry = Date.parse(expiresAtUtc);
  if (Number.isNaN(expiry)) return null;
  return Math.max(0, expiry - REFRESH_LEAD_TIME_MS - now);
}

/** True when the refresh token can no longer renew the session. */
export function isRefreshTokenExpired(
  refreshTokenExpiresAtUtc: string,
  now = Date.now(),
): boolean {
  const expiry = Date.parse(refreshTokenExpiresAtUtc);
  return Number.isNaN(expiry) ? true : expiry <= now;
}
