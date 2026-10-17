import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Plus, Search, Settings } from 'lucide-react';
import { IconButton } from '@/presentation/components/ui/IconButton';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { en } from '@/presentation/i18n/en';
import { IS_MOCK_PROVIDER } from '@/app/composition';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { useTenants } from '@/presentation/hooks/queries';
import { cn } from '@/presentation/lib/cn';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/restaurants': 'Restaurants',
  '/subscriptions': 'Subscriptions',
  '/accounts': 'Accounts & Roles',
  '/activity': 'Activity Logs',
  '/settings': 'Platform Settings',
};

const MAX_SUGGESTIONS = 6;

export interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const title = ROUTE_TITLES[location.pathname] ?? 'Nawy Orders';
  const debounced = useDebounce(query.trim(), 200);
  const hasQuery = debounced.length > 0;
  const { data, isFetching } = useTenants(hasQuery ? { search: debounced } : {});
  const matches = useMemo(
    () => (hasQuery ? (data ?? []).slice(0, MAX_SUGGESTIONS) : []),
    [data, hasQuery],
  );
  const showList = open && hasQuery;

  useEffect(() => {
    setActiveIndex(-1);
  }, [debounced]);

  function goToList(search: string) {
    navigate(`/restaurants?q=${encodeURIComponent(search.trim())}`);
    setOpen(false);
  }

  function selectTenant(id: string) {
    navigate(`/restaurants/${id}`);
    setOpen(false);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (open && activeIndex >= 0 && matches[activeIndex]) {
      selectTenant(matches[activeIndex]!.id);
      return;
    }
    goToList(trimmed);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!showList) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(matches.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? matches.length - 1 : index - 1));
    }
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
        <form
          onSubmit={submit}
          role="search"
          className="relative hidden md:block"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setOpen(false);
            }
          }}
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={en.topbar.searchPlaceholder}
            aria-label={en.topbar.searchPlaceholder}
            role="combobox"
            aria-expanded={showList}
            aria-controls="topbar-search-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `topbar-search-option-${activeIndex}` : undefined
            }
            className="h-11 w-64 rounded-panel border border-border bg-card ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />

          {showList && (
            <div
              id="topbar-search-listbox"
              role="listbox"
              aria-label={en.topbar.suggestionsLabel}
              className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-panel border border-border bg-card py-1 shadow-lg"
            >
              {matches.length === 0 ? (
                <p className="px-3 py-2 text-sm text-text-muted">
                  {isFetching ? en.common.loading : en.topbar.noMatches}
                </p>
              ) : (
                matches.map((tenant, index) => (
                  <button
                    type="button"
                    key={tenant.id}
                    id={`topbar-search-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectTenant(tenant.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm text-text',
                      index === activeIndex ? 'bg-muted' : 'hover:bg-muted/60',
                    )}
                  >
                    <span className="truncate">{tenant.restaurantName}</span>
                    <span className="shrink-0 font-mono text-xs text-text-muted">
                      {tenant.tenantId}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
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
