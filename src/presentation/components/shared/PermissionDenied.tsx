import { ShieldAlert } from 'lucide-react';
import { en } from '@/presentation/i18n/en';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';

export function PermissionDenied({ action }: { action?: string }) {
  const { user } = useCurrentUser();

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-card border border-border bg-card px-6 py-16 text-center shadow-card"
    >
      <div className="flex size-16 items-center justify-center rounded-avatar bg-danger-bg text-danger-fg">
        <ShieldAlert aria-hidden="true" className="size-8" />
      </div>
      <h1 className="text-xl font-semibold text-text">{en.permissions.deniedTitle}</h1>
      <p className="max-w-md text-sm text-text-muted">
        {en.permissions.deniedBody} {action ? `(${action})` : ''}
      </p>
      <p className="text-2xs text-text-muted">
        {user ? `${user.name} · ${user.role}` : ''}
      </p>
    </div>
  );
}