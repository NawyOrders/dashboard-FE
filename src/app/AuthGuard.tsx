import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/presentation/hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}
