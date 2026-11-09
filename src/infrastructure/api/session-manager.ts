import type { PlatformLoginResponse } from '@/domain/entities';
import { adminUserFromPlatformLogin } from '@/domain/rules/platform-auth';
import { isRefreshTokenExpired } from '@/domain/rules/session';
import { clearTokenSet, readTokenSet, saveTokenSet } from './access-token';

export const SESSION_REFRESHED_EVENT = 'platform:session-refreshed';
export const SESSION_EXPIRED_EVENT = 'platform:session-expired';

export interface SessionManager {
  /** One refresh at a time; null means the session was cleared and the expiry event fired. */
  refresh(): Promise<PlatformLoginResponse | null>;
}

/** Clears the token store and tells the auth provider to return to /login. */
export function notifySessionExpired(): void {
  clearTokenSet();
  dispatch(SESSION_EXPIRED_EVENT);
}

/**
 * Single-flight session refresh (agent.md section 28). Concurrent 401s and the proactive
 * timer share one call; a success stores the rotated tokens and emits the refreshed event.
 */
export function createSessionManager(
  refreshSession: (refreshToken: string) => Promise<PlatformLoginResponse>,
): SessionManager {
  let inFlight: Promise<PlatformLoginResponse | null> | null = null;

  async function run(): Promise<PlatformLoginResponse | null> {
    const tokens = readTokenSet();
    if (!tokens || isRefreshTokenExpired(tokens.refreshTokenExpiresAtUtc)) {
      notifySessionExpired();
      return null;
    }
    try {
      const session = await refreshSession(tokens.refreshToken);
      saveTokenSet({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAtUtc: session.expiresAtUtc,
        refreshTokenExpiresAtUtc: session.refreshTokenExpiresAtUtc,
        tokenType: session.tokenType,
      });
      dispatch(SESSION_REFRESHED_EVENT, adminUserFromPlatformLogin(session));
      return session;
    } catch {
      notifySessionExpired();
      return null;
    }
  }

  return {
    refresh() {
      inFlight ??= run().finally(() => {
        inFlight = null;
      });
      return inFlight;
    },
  };
}

function dispatch(event: string, detail?: unknown): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(event, { detail }));
}
