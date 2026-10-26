/** Key of the stored platform token pair (see providers.tsx). */
export const PLATFORM_TOKEN_STORAGE_KEY = 'nawy_platform_tokens';

/**
 * Reads the current access token, if one exists. The token is optional: the static
 * demo issues its own token, and the HTTP client only adds the header when present.
 */
export function readAccessToken(): string | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(PLATFORM_TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'accessToken' in parsed &&
      typeof (parsed as { accessToken: unknown }).accessToken === 'string'
    ) {
      return (parsed as { accessToken: string }).accessToken;
    }
    return null;
  } catch {
    return null;
  }
}
