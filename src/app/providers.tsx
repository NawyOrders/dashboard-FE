import { useEffect, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, CurrentUserContext } from './contexts';
import { ToastProvider } from '@/presentation/components/ui/Toast';
import { api } from '@/app/composition';
import type { AdminUser, PlatformLoginResult, Role } from '@/domain/entities';
import { adminUserFromPlatformLogin } from '@/domain/rules/platform-auth';
import { PLATFORM_TOKEN_STORAGE_KEY as TOKEN_STORAGE_KEY } from '@/infrastructure/api/access-token';

interface StoredPlatformTokens {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  tokenType: 'Bearer';
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
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const raw = sessionStorage.getItem('nawy_session');
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  });

  async function signIn(email: string, password: string): Promise<PlatformLoginResult> {
    const result = await api.signIn(email, password);
    if (!result.ok) return result;

    const user = adminUserFromPlatformLogin(result.session);
    setUser(user);
    const tokens: StoredPlatformTokens = {
      accessToken: result.session.accessToken,
      refreshToken: result.session.refreshToken,
      expiresAtUtc: result.session.expiresAtUtc,
      refreshTokenExpiresAtUtc: result.session.refreshTokenExpiresAtUtc,
      tokenType: result.session.tokenType,
    };
    try {
      // OPEN: token storage is sessionStorage (owner-confirmed temporary), see agent.md section 19.
      sessionStorage.setItem('nawy_session', JSON.stringify(user));
      sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch {
      // ignore
    }
    return result;
  }

  function signOut() {
    setUser(null);
    try {
      sessionStorage.removeItem('nawy_session');
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
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

