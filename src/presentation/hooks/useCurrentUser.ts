import { useContext } from 'react';
import { CurrentUserContext } from '@/app/contexts';
import type { CurrentUserContextValue } from '@/app/contexts';

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error('useCurrentUser must be used within CurrentUserProvider');
  return ctx;
}
