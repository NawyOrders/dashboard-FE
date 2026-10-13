import { Download, Search } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Select } from '@/presentation/components/ui/Select';
import { en } from '@/presentation/i18n/en';
import type { TenantSort } from '@/application/dto';
import { RestaurantFiltersButton } from './RestaurantFiltersButton';
import type { DirectoryState } from './useDirectoryState';

const SORT_OPTIONS: { value: TenantSort; label: string }[] = [
  { value: 'newest', label: en.restaurants.sortNewest },
  { value: 'oldest', label: en.restaurants.sortOldest },
  { value: 'name_asc', label: en.restaurants.sortNameAsc },
  { value: 'expiry_asc', label: en.restaurants.sortExpiryAsc },
];

export interface RestaurantToolbarProps {
  directory: DirectoryState;
  onExport: () => void;
}

export function RestaurantToolbar({ directory, onExport }: RestaurantToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1 sm:flex-none">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          value={directory.searchInput}
          onChange={(event) => directory.setSearchInput(event.target.value)}
          placeholder={en.restaurants.searchPlaceholder}
          aria-label={en.restaurants.searchPlaceholder}
          className="h-11 w-full rounded-panel border border-border bg-card ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none sm:w-56"
        />
      </div>

      <div className="w-44">
        <Select
          aria-label={en.restaurants.sortBy}
          value={directory.sort}
          onChange={(event) => directory.setSort(event.target.value as TenantSort)}
          options={SORT_OPTIONS}
        />
      </div>

      <RestaurantFiltersButton
        filters={directory.filters}
        activeFilterCount={directory.activeFilterCount}
        onChange={directory.setFilter}
        onClear={directory.clearFilters}
      />

      <Button variant="secondary" onClick={onExport}>
        <Download aria-hidden="true" className="size-4" />
        {en.common.export}
      </Button>
    </div>
  );
}