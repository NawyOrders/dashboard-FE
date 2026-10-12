import { NavLink } from 'react-router-dom';
import { Flame, LayoutDashboard, Store, CreditCard, Layers, ScrollText, Settings, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { en } from '@/i18n/en';
import { AccountMenu } from './AccountMenu';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: en.nav.overview, icon: <LayoutDashboard aria-hidden="true" className="size-5" />, end: true },
  { to: '/restaurants', label: en.nav.restaurants, icon: <Store aria-hidden="true" className="size-5" /> },
  { to: '/subscriptions', label: en.nav.subscriptions, icon: <CreditCard aria-hidden="true" className="size-5" /> },
  { to: '/packages', label: en.nav.packages, icon: <Layers aria-hidden="true" className="size-5" /> },
  { to: '/activity', label: en.nav.activity, icon: <ScrollText aria-hidden="true" className="size-5" /> },
  { to: '/settings', label: en.nav.settings, icon: <Settings aria-hidden="true" className="size-5" /> },
];

function Logo() {
  return (
    <div className="flex items-center gap-3 px-5 py-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br from-primary to-primary-light text-white shadow-primary">
        <Flame aria-hidden="true" className="size-6" />
      </span>
      <span className="hidden min-w-0 xl:block">
        <span className="block text-base font-bold leading-5 text-text">Nawy Orders</span>
        <span className="block text-2xs text-text-muted">Super Admin</span>
      </span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex h-12 items-center gap-3 rounded-panel px-3 text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary text-white shadow-primary'
                : 'text-text-muted hover:bg-bg-2 hover:text-text',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden xl:inline">{item.label}</span>
              {isActive && (
                <ChevronRight
                  aria-hidden="true"
                  className="absolute end-2 hidden size-4 xl:block"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-sidebar flex-col border-e border-border bg-card md:hidden',
          'transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Logo />
        <NavList onNavigate={onClose} />
        <AccountMenu />
      </aside>
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[72px] flex-col border-e border-border bg-card md:flex xl:w-sidebar">
        <Logo />
        <NavList />
        <AccountMenu />
      </aside>
    </>
  );
}