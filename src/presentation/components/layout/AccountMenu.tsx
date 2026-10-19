import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export interface AccountMenuProps {
  variant?: 'drawer' | 'rail';
}

export function AccountMenu({ variant = 'rail' }: AccountMenuProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!user) return <div className="h-16 animate-pulse rounded-panel bg-neutral-bg" />;

  function signOut() {
    setOpen(false);
    toast({ title: 'Signed out (demo)', variant: 'neutral' });
  }

  return (
    <div ref={ref} className="relative border-t border-border p-3">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-panel p-2 text-start transition-colors duration-150 hover:bg-bg-2"
      >
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-avatar bg-primary font-semibold text-white"
        >
          {initials(user.name)}
        </span>
        <span className={cn('min-w-0', variant === 'drawer' ? 'block' : 'hidden xl:block')}>
          <span className="block truncate text-sm font-semibold text-text">{user.name}</span>
          <span className="block truncate text-2xs text-text-muted">
            {user.role === 'super_admin' ? en.app.role : 'Support'}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'ms-auto size-4 text-text-muted',
            variant === 'drawer' ? 'block' : 'hidden xl:block',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full start-2 z-20 mb-2 w-72 rounded-card border border-border bg-card p-2"
        >
          <div className="border-b border-border p-3">
            <p className="truncate text-sm font-semibold text-text">{user.name}</p>
            <p className="truncate text-2xs text-text-muted">{user.email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-pill px-3 py-2 text-sm text-text transition-colors duration-150 hover:bg-danger-bg hover:text-danger-fg"
          >
            <LogOut aria-hidden="true" className="size-4" />
            {en.common.signOut}
          </button>
        </div>
      )}

      {variant === 'drawer' && (
        <button
          type="button"
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-2 rounded-panel px-3 py-2 text-sm text-text transition-colors duration-150 hover:bg-danger-bg hover:text-danger-fg"
        >
          <LogOut aria-hidden="true" className="size-4" />
          {en.common.signOut}
        </button>
      )}
    </div>
  );
}