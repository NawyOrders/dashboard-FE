import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Plus, Search, Settings } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { en } from '@/i18n/en';
import { IS_MOCK_PROVIDER } from '@/services';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/restaurants': 'Restaurants',
  '/subscriptions': 'Subscriptions',
  '/packages': 'Packages & Features',
  '/activity': 'Activity Logs',
  '/settings': 'Platform Settings',
};

export interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const title = ROUTE_TITLES[location.pathname] ?? 'Nawy Orders';

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(`/restaurants?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-bg/90 px-6 py-3 backdrop-blur md:px-8">
      <IconButton label="Open navigation" variant="ghost" className="md:hidden" onClick={onMenuClick}>
        <Menu aria-hidden="true" className="size-5" />
      </IconButton>

      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-lg font-semibold text-text">{title}</span>
        {IS_MOCK_PROVIDER && (
          <Badge tone="warning" title={en.app.demoBadgeTitle} className="shrink-0">
            {en.app.demoBadge}
          </Badge>
        )}
      </div>

      <div className="ms-auto flex items-center gap-2">
        <form onSubmit={submit} role="search" className="relative hidden md:block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={en.topbar.searchPlaceholder}
            aria-label={en.topbar.searchPlaceholder}
            className="h-11 w-64 rounded-panel border border-border bg-card ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </form>

        <Tooltip label={en.topbar.notificationsDisabled}>
          <IconButton label={en.topbar.notifications} disabled>
            <Bell aria-hidden="true" className="size-5" />
          </IconButton>
        </Tooltip>

        <IconButton label={en.topbar.settings} onClick={() => navigate('/settings')}>
          <Settings aria-hidden="true" className="size-5" />
        </IconButton>

        <Button onClick={() => navigate('/restaurants/new')} className="hidden sm:inline-flex">
          <Plus aria-hidden="true" className="size-4" />
          {en.topbar.addRestaurant}
        </Button>
        <IconButton
          label={en.topbar.addRestaurant}
          className="text-primary sm:hidden"
          onClick={() => navigate('/restaurants/new')}
        >
          <Plus aria-hidden="true" className="size-6" />
        </IconButton>
      </div>
    </header>
  );
}