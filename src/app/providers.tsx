import { useEffect, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, CurrentUserContext } from './contexts';
import { ToastProvider } from '@/presentation/components/ui/Toast';
import { api, refreshPlatformSession } from '@/app/composition';
import { router } from '@/app/router';
import type { AdminUser, PlatformLoginResult, Role } from '@/domain/entities';
import { adminUserFromPlatformLogin } from '@/domain/rules/platform-auth';
import { isRefreshTokenExpired, refreshDelayMs } from '@/domain/rules/session';
import {
  clearTokenSet,
  readRefreshToken,
  readTokenSet,
  saveTokenSet,
  type PlatformTokenSet,
} from '@/infrastructure/api/access-token';
import {
  SESSION_EXPIRED_EVENT,
  SESSION_REFRESHED_EVENT,
} from '@/infrastructure/api/session-manager';

const SESSION_USER_KEY = 'nawy_session';

function readStoredUser(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

function persistStoredUser(user: AdminUser): void {
  try {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function clearStoredUser(): void {
  try {
    sessionStorage.removeItem(SESSION_USER_KEY);
  } catch {
    // ignore
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(readStoredUser);
  const [tokens, setTokens] = useState<PlatformTokenSet | null>(readTokenSet);

  useEffect(() => {
    function handleRefreshed(event: Event) {
      const refreshedUser = (event as CustomEvent<AdminUser>).detail;
      setUser(refreshedUser);
      persistStoredUser(refreshedUser);
      setTokens(readTokenSet());
    }
    function handleExpired() {
      setUser(null);
      setTokens(null);
      clearStoredUser();
      router.navigate('/login?reason=expired', { replace: true });
    }
    window.addEventListener(SESSION_REFRESHED_EVENT, handleRefreshed);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => {
      window.removeEventListener(SESSION_REFRESHED_EVENT, handleRefreshed);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  // Proactive refresh 90 seconds before expiry, rescheduled by every successful refresh.
  useEffect(() => {
    if (!tokens) return;
    if (isRefreshTokenExpired(tokens.refreshTokenExpiresAtUtc)) {
      void refreshPlatformSession();
      return;
    }
    const delay = refreshDelayMs(tokens.expiresAtUtc);
    if (delay === null) return;
    const timer = window.setTimeout(() => {
      void refreshPlatformSession();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [tokens]);

  async function signIn(email: string, password: string): Promise<PlatformLoginResult> {
    const result = await api.signIn(email, password);
    if (!result.ok) return result;

    const user = adminUserFromPlatformLogin(result.session);
    setUser(user);
    saveTokenSet({
      accessToken: result.session.accessToken,
      refreshToken: result.session.refreshToken,
      expiresAtUtc: result.session.expiresAtUtc,
      refreshTokenExpiresAtUtc: result.session.refreshTokenExpiresAtUtc,
      tokenType: result.session.tokenType,
    });
    setTokens(readTokenSet());
    persistStoredUser(user);
    return result;
  }

  async function signOut(): Promise<void> {
    const refreshToken = readRefreshToken();
    try {
      if (refreshToken) await api.logout(refreshToken);
    } catch {
      // The local session is cleared whether or not the server call succeeds.
    } finally {
      setUser(null);
      setTokens(null);
      clearTokenSet();
      clearStoredUser();
    }
    router.navigate('/login', { replace: true });
  }

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

function CurrentUserInner({ children }: { children: ReactNode }) {
  const [roleOverride, setRoleOverride] = useState<Role>('super_admin');
  const auth = useContext(AuthContext);
  const authUser = auth?.user ?? null;
  const [fallbackUser, setFallbackUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!authUser) {
      api
        .getCurrentUser()
        .then(setFallbackUser)
        .catch(() => setFallbackUser(null));
    }
  }, [authUser]);

  const effectiveUser: AdminUser | null = authUser
    ? (authUser as AdminUser)
    : fallbackUser
      ? ({ ...(fallbackUser as AdminUser), role: roleOverride } as AdminUser)
      : null;
  const role = effectiveUser?.role ?? roleOverride;

  return (
    <CurrentUserContext.Provider value={{ user: effectiveUser, role, setRole: setRoleOverride }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

function CurrentUserProvider({ children }: { children: ReactNode }) {
  return <CurrentUserInner>{children}</CurrentUserInner>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrentUserProvider>
          <ToastProvider>{children}</ToastProvider>
        </CurrentUserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

