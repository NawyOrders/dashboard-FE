/** Key of the stored platform token pair. This module is the only token reader/writer. */
export const PLATFORM_TOKEN_STORAGE_KEY = 'nawy_platform_tokens';

export interface PlatformTokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  tokenType: 'Bearer';
}

function isTokenSet(value: unknown): value is PlatformTokenSet {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.accessToken === 'string' &&
    typeof record.refreshToken === 'string' &&
    typeof record.expiresAtUtc === 'string' &&
    typeof record.refreshTokenExpiresAtUtc === 'string' &&
    record.tokenType === 'Bearer'
  );
}

/** Reads the stored token pair, or null when the session has no tokens. */
export function readTokenSet(): PlatformTokenSet | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(PLATFORM_TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isTokenSet(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Reads the current access token. The static demo also has one. */
export function readAccessToken(): string | null {
  return readTokenSet()?.accessToken ?? null;
}

export function readRefreshToken(): string | null {
  return readTokenSet()?.refreshToken ?? null;
}

// OPEN: token storage is sessionStorage (owner-confirmed temporary), see agent.md section 19.
export function saveTokenSet(tokens: PlatformTokenSet): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(PLATFORM_TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Storage can be unavailable; the in-memory session still works.
  }
}

export function clearTokenSet(): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(PLATFORM_TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}
