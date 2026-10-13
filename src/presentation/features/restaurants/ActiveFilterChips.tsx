import { X } from 'lucide-react';
import { en } from '@/presentation/i18n/en';
import type { DirectoryFilters } from './types';

interface Chip {
  key: keyof DirectoryFilters;
  label: string;
}

function buildChips(filters: DirectoryFilters): Chip[] {
  const chips: Chip[] = [];
  if (filters.packageCode) {
    chips.push({
      key: 'packageCode',
      label: `${en.restaurants.filters.package}: ${filters.packageCode === 'growth' ? 'Growth' : 'Start'}`,
    });
  }
  if (filters.restaurantStatus) {
    chips.push({
      key: 'restaurantStatus',
      label: `${en.restaurants.filters.restaurantStatus}: ${en.status.restaurant[filters.restaurantStatus]}`,
    });
  }
  if (filters.subscriptionStatus) {
    chips.push({
      key: 'subscriptionStatus',
      label: `${en.restaurants.filters.subscriptionStatus}: ${en.status.subscription[filters.subscriptionStatus]}`,
    });
  }
  if (filters.expiringSoon) chips.push({ key: 'expiringSoon', label: en.restaurants.filters.expiringSoon });
  if (filters.growthOnly) chips.push({ key: 'growthOnly', label: en.restaurants.filters.growthOnly });
  return chips;
}

export interface ActiveFilterChipsProps {
  filters: DirectoryFilters;
  onChange: <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => void;
  onClear: () => void;
}

export function ActiveFilterChips({ filters, onChange, onClear }: ActiveFilterChipsProps) {
  const chips = buildChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.key, undefined as never)}
          className="inline-flex items-center gap-1.5 rounded-pill bg-bg-2 px-3 py-1.5 text-2xs font-medium text-primary-dark transition-colors duration-150 hover:bg-primary-light/20"
        >
          {chip.label}
          <X aria-hidden="true" className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-2xs font-medium text-primary underline underline-offset-2"
      >
        {en.common.clearFilters}
      </button>
    </div>
  );
}
