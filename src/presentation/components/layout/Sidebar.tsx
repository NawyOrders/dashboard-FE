import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Inbox, CreditCard, BarChart3, Users, ScrollText, Settings, ChevronRight, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/presentation/lib/cn';
import nawyOrdersLogo from '@/assets/nawy-orders-logo.png';
import { en } from '@/presentation/i18n/en';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { isAllowed } from '@/domain/rules/permissions';
import type { Permission } from '@/domain/entities';
import { AccountMenu } from './AccountMenu';

interface NavItem {
  to: string;
  label: keyof typeof en.nav;
  icon: ReactNode;
  end?: boolean;
  permission?: Permission;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'overview', icon: <LayoutDashboard aria-hidden="true" className="size-5" />, end: true },
  { to: '/restaurants', label: 'restaurants', icon: <Store aria-hidden="true" className="size-5" /> },
  { to: '/applications', label: 'applications', icon: <Inbox aria-hidden="true" className="size-5" />, permission: 'restaurant.create' },
  { to: '/subscriptions', label: 'subscriptions', icon: <CreditCard aria-hidden="true" className="size-5" /> },
  { to: '/analytics', label: 'analytics', icon: <BarChart3 aria-hidden="true" className="size-5" />, permission: 'analytics.view' },
  { to: '/accounts', label: 'accounts', icon: <Users aria-hidden="true" className="size-5" />, permission: 'accounts.view' },
  { to: '/activity', label: 'activity', icon: <ScrollText aria-hidden="true" className="size-5" /> },
  { to: '/settings', label: 'settings', icon: <Settings aria-hidden="true" className="size-5" /> },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * `drawer` = off-canvas mobile menu: icon + full text label for every item (never icon-only).
 * `rail`   = 768–1279 icon rail with tooltips; labels appear at ≥1280.
 */
type SidebarVariant = 'drawer' | 'rail';

function Logo({ variant }: { variant: SidebarVariant }) {
  return (
    <div className="flex items-center gap-3 px-5 py-6">
      <img src={nawyOrdersLogo} alt={en.app.name} className="h-[50px] w-auto shrink-0 object-contain" />
      <span className={cn('min-w-0', variant === 'drawer' ? 'block' : 'hidden xl:block')}>
        <span className="block text-base font-bold leading-5 text-text">{en.app.name}</span>
        <span className="block text-2xs text-text-muted">{en.app.role}</span>
      </span>
    </div>
  );
}

function NavList({ variant, onNavigate }: { variant: SidebarVariant; onNavigate?: () => void }) {
  const { role } = useCurrentUser();
  const items = NAV_ITEMS.filter((item) => !item.permission || isAllowed(role, item.permission));

  return (
    <nav aria-label={en.topbar.mainNavigation} className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {items.map((item) => {
        const label = en.nav[item.label];
        const link = (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex h-12 w-full items-center gap-3 rounded-panel px-3 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-bg-2 hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="shrink-0">{item.icon}</span>
                <span
                  className={cn(
                    'whitespace-nowrap',
                    variant === 'drawer' ? 'min-w-0 flex-1 truncate' : 'hidden xl:inline',
                  )}
                >
                  {label}
                </span>
                {isActive && (
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      'absolute end-2 size-4 rtl:rotate-180',
                      variant === 'drawer' ? 'block' : 'hidden xl:block',
                    )}
                  />
                )}
              </>
            )}
          </NavLink>
        );

        if (variant === 'drawer') return link;

        return (
          <Tooltip
            key={item.to}
            label={label}
            side="right"
            className="w-full"
            bubbleClassName="xl:group-hover:hidden xl:group-focus-within:hidden"
          >
            {link}
          </Tooltip>
        );
      })}
    </nav>
  );
}

export interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );

    focusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen, onClose]);

  return (
    <>
      {mobileOpen && (
        <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />
      )}

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={en.topbar.mainNavigation}
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-[min(85vw,320px)] flex-col border-e border-border bg-card md:hidden',
          'transition-transform duration-200 ease-out',
          mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full rtl:translate-x-full',
        )}
      >
        <div className="flex items-start justify-between">
          <Logo variant="drawer" />
          <button
            type="button"
            aria-label={en.topbar.closeNavigation}
            onClick={onClose}
            className="me-3 mt-4 inline-flex size-9 items-center justify-center rounded-panel text-text-muted transition-colors duration-150 hover:bg-bg-2 hover:text-text"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <NavList variant="drawer" onNavigate={onClose} />
        <AccountMenu variant="drawer" />
      </aside>

      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[72px] flex-col border-e border-border bg-card md:flex xl:w-sidebar">
        <Logo variant="rail" />
        <NavList variant="rail" />
        <AccountMenu variant="rail" />
      </aside>
    </>
  );
}
