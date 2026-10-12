import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { en } from '@/i18n/en';
import { cn } from '@/lib/cn';
import type { Role } from '@/types';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export function AccountMenu() {
  const { user, role, setRole } = useCurrentUser();
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
        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-sm font-semibold text-text">{user.name}</span>
          <span className="block truncate text-2xs text-text-muted">
            {user.role === 'super_admin' ? en.app.role : 'Support'}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('ms-auto hidden size-4 text-text-muted xl:block', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full start-2 z-20 mb-2 w-72 rounded-card border border-border bg-card p-2 shadow-card"
        >
          <div className="border-b border-border p-3">
            <p className="truncate text-sm font-semibold text-text">{user.name}</p>
            <p className="truncate text-2xs text-text-muted">{user.email}</p>
          </div>

          <div className="p-3">
            <p className="mb-2 flex items-center gap-1.5 text-2xs font-medium text-text-muted">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              {en.permissions.switchRole}
            </p>
            <div role="group" aria-label={en.permissions.switchRole} className="flex gap-1">
              {(['super_admin', 'support'] as Role[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="menuitemradio"
                  aria-checked={role === option}
                  onClick={() => setRole(option)}
                  className={cn(
                    'flex-1 rounded-pill px-2 py-1.5 text-2xs font-medium transition-colors duration-150',
                    role === option
                      ? 'bg-primary text-white'
                      : 'bg-neutral-bg text-text-muted hover:text-text',
                  )}
                >
                  {option === 'super_admin' ? 'Super Admin' : 'Support'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              toast({ title: 'Signed out (demo)', variant: 'info' });
            }}
            className="flex w-full items-center gap-2 rounded-pill px-3 py-2 text-sm text-text transition-colors duration-150 hover:bg-danger-bg hover:text-danger-fg"
          >
            <LogOut aria-hidden="true" className="size-4" />
            {en.common.signOut}
          </button>
        </div>
      )}
    </div>
  );
}