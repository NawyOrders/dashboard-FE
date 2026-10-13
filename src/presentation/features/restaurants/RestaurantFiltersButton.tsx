import { useEffect, useRef, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Checkbox } from '@/presentation/components/ui/Checkbox';
import { Select } from '@/presentation/components/ui/Select';
import { en } from '@/presentation/i18n/en';
import type { PackageCode, RestaurantStatus, SubscriptionStatus } from '@/domain/entities';
import type { DirectoryFilters } from './types';

const PACKAGE_OPTIONS = [
  { value: 'start', label: 'Start' },
  { value: 'growth', label: 'Growth' },
];

const RESTAURANT_STATUS_OPTIONS: { value: RestaurantStatus; label: string }[] = [
  { value: 'active', label: en.status.restaurant.active },
  { value: 'pending', label: en.status.restaurant.pending },
  { value: 'inactive', label: en.status.restaurant.inactive },
];

const SUBSCRIPTION_STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active', label: en.status.subscription.active },
  { value: 'expiring_soon', label: en.status.subscription.expiring_soon },
  { value: 'expired', label: en.status.subscription.expired },
  { value: 'not_started', label: en.status.subscription.not_started },
];

export interface RestaurantFiltersButtonProps {
  filters: DirectoryFilters;
  activeFilterCount: number;
  onChange: <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => void;
  onClear: () => void;
}

export function RestaurantFiltersButton({
  filters,
  activeFilterCount,
  onChange,
  onClear,
}: RestaurantFiltersButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="secondary"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Filter aria-hidden="true" className="size-4" />
        {en.restaurants.filter}
        {activeFilterCount > 0 && (
          <span className="ms-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-2xs font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label={en.restaurants.filter}
          className="absolute end-0 z-30 mt-2 w-80 rounded-card border border-border bg-card p-5 shadow-card"
        >
          <div className="flex flex-col gap-4">
            <Select
              label={en.restaurants.filters.package}
              placeholder={en.common.all}
              value={filters.packageCode ?? ''}
              onChange={(event) => onChange('packageCode', (event.target.value || undefined) as PackageCode | undefined)}
              options={PACKAGE_OPTIONS}
            />
            <Select
              label={en.restaurants.filters.restaurantStatus}
              placeholder={en.common.all}
              value={filters.restaurantStatus ?? ''}
              onChange={(event) =>
                onChange('restaurantStatus', (event.target.value || undefined) as RestaurantStatus | undefined)
              }
              options={RESTAURANT_STATUS_OPTIONS}
            />
            <Select
              label={en.restaurants.filters.subscriptionStatus}
              placeholder={en.common.all}
              value={filters.subscriptionStatus ?? ''}
              onChange={(event) =>
                onChange('subscriptionStatus', (event.target.value || undefined) as SubscriptionStatus | undefined)
              }
              options={SUBSCRIPTION_STATUS_OPTIONS}
            />
            <Checkbox
              label={en.restaurants.filters.expiringSoon}
              checked={Boolean(filters.expiringSoon)}
              onChange={(event) => onChange('expiringSoon', event.target.checked || undefined)}
            />
            <Checkbox
              label={en.restaurants.filters.growthOnly}
              checked={Boolean(filters.growthOnly)}
              onChange={(event) => onChange('growthOnly', event.target.checked || undefined)}
            />
            <div className="flex justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={onClear} disabled={activeFilterCount === 0}>
                {en.common.clearFilters}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}