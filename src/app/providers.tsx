import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrentUserContext } from './contexts';
import { ToastProvider } from '@/presentation/components/ui/Toast';
import { api } from '@/app/composition';
import type { AdminUser, Role } from '@/domain/entities';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('super_admin');
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    api.getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const effectiveUser: AdminUser | null = user ? { ...user, role } : user;

  return (
    <CurrentUserContext.Provider value={{ user: effectiveUser, role, setRole }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider>
        <ToastProvider>{children}</ToastProvider>
      </CurrentUserProvider>
    </QueryClientProvider>
  );
}