import { ClipboardList, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/presentation/components/ui/Checkbox';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { DropdownMenu } from '@/presentation/components/ui/DropdownMenu';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { restaurantStatusMeta, subscriptionStatusMeta } from '@/presentation/lib/status';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import type { Tenant } from '@/domain/entities';

export interface RestaurantRowProps {
  tenant: Tenant;
  selected: boolean;
  onToggle: (id: string) => void;
}

function RestaurantNames({ tenant, className }: { tenant: Tenant; className?: string }) {
  return (
    <span className={cn('flex min-w-0 flex-col items-start', className)}>
      {tenant.restaurantNameAr ? (
        <>
          <span dir="rtl" className="max-w-full truncate text-sm font-semibold text-text">
            {tenant.restaurantNameAr}
          </span>
          <span dir="ltr" className="max-w-full truncate text-2xs text-text-muted">
            {tenant.restaurantName}
          </span>
        </>
      ) : (
        <span dir="ltr" className="max-w-full truncate text-sm font-semibold text-text">
          {tenant.restaurantName}
        </span>
      )}
    </span>
  );
}

function RowActions({ tenant, onOpen }: { tenant: Tenant; onOpen: (tab: string) => void }) {
  return (
    <DropdownMenu
      label={en.common.actionsFor(tenant.restaurantName)}
      items={[
        {
          key: 'view',
          label: en.common.viewDetails,
          icon: <Eye aria-hidden="true" className="size-4" />,
          onSelect: () => onOpen('overview'),
        },
        {
          key: 'activity',
          label: en.common.activityLog,
          icon: <ClipboardList aria-hidden="true" className="size-4" />,
          onSelect: () => onOpen('activity'),
        },
      ]}
    />
  );
}

export function RestaurantRow({ tenant, selected, onToggle }: RestaurantRowProps) {
  const navigate = useNavigate();

  const openTab = (tab: string) => navigate(`/restaurants/${tenant.id}?tab=${tab}`);

  const stickyCell = cn('sticky z-10', selected ? 'bg-bg-2' : 'bg-card group-hover:bg-bg-2');
  const cell = cn('px-3 py-4 align-middle', selected ? 'bg-bg-2' : 'group-hover:bg-bg-2');
  // OPEN: backend to add start date, expiry date, branches, website/PWA and mobile apps
  // to the tenant list.
  const notInListYet = en.common.notAvailable;

  return (
    <tr className="group border-b border-border last:border-0">
      <td className={cn(stickyCell, 'start-0 w-12 ps-4')}>
        <Checkbox
          checked={selected}
          onChange={() => onToggle(tenant.id)}
          aria-label={en.common.selectRestaurantRow(tenant.restaurantName)}
        />
      </td>
      <td className={cn(stickyCell, 'start-12 min-w-[200px] pe-4')}>
        <button
          type="button"
          onClick={() => openTab('overview')}
          title={tenant.restaurantName}
          className="block max-w-[220px] text-start"
        >
          <RestaurantNames tenant={tenant} />
        </button>
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        {tenant.subscription.packageCode ? (
          <PackagePill code={tenant.subscription.packageCode} />
        ) : (
          notInListYet
        )}
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <StatusPill meta={restaurantStatusMeta(tenant.status)} />
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
      </td>
      <td className={cn(cell, 'tabular whitespace-nowrap text-text-muted')}>{notInListYet}</td>
      <td className={cn(cell, 'tabular whitespace-nowrap text-text-muted')}>{notInListYet}</td>
      <td className={cn(cell, 'tabular whitespace-nowrap text-text-muted')}>{notInListYet}</td>
      <td className={cn(cell, 'whitespace-nowrap text-text-muted')}>{notInListYet}</td>
      <td className={cn(cell, 'whitespace-nowrap text-text-muted')}>{notInListYet}</td>
      <td className={cn(cell, 'whitespace-nowrap pe-4')}>
        <RowActions tenant={tenant} onOpen={openTab} />
      </td>
    </tr>
  );
}

/** Below `md` each restaurant is a card: names and both status pills on the first line. */
export function RestaurantCard({ tenant, selected, onToggle }: RestaurantRowProps) {
  const navigate = useNavigate();

  const openTab = (tab: string) => navigate(`/restaurants/${tenant.id}?tab=${tab}`);
  // OPEN: backend to add start date, expiry date, branches, website/PWA and mobile apps
  // to the tenant list.
  const notInListYet = en.common.notAvailable;

  return (
    <li className={cn('rounded-card border border-border bg-card p-4', selected && 'bg-bg-2')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="pt-1">
            <Checkbox
              checked={selected}
              onChange={() => onToggle(tenant.id)}
              aria-label={en.common.selectRestaurantRow(tenant.restaurantName)}
            />
          </span>
          <button
            type="button"
            onClick={() => openTab('overview')}
            title={tenant.restaurantName}
            className="min-w-0 text-start"
          >
            <RestaurantNames tenant={tenant} />
          </button>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <StatusPill meta={restaurantStatusMeta(tenant.status)} />
          <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-2xs">
        <div className="min-w-0">
          <dt className="text-text-muted">{en.restaurants.columns.package}</dt>
          <dd className="mt-1">
            {tenant.subscription.packageCode ? (
              <PackagePill code={tenant.subscription.packageCode} />
            ) : (
              notInListYet
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-text-muted">{en.restaurants.columns.startDate}</dt>
          <dd className="mt-1 tabular text-text-muted">{notInListYet}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-text-muted">{en.restaurants.columns.expiryDate}</dt>
          <dd className="mt-1 tabular text-text-muted">{notInListYet}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-text-muted">{en.restaurants.columns.branches}</dt>
          <dd className="mt-1 tabular text-text-muted">{notInListYet}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-text-muted">{en.restaurants.columns.website}</dt>
          <dd className="mt-1 text-text-muted">{notInListYet}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-text-muted">{en.restaurants.columns.apps}</dt>
          <dd className="mt-1 text-text-muted">{notInListYet}</dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-end border-t border-border pt-3">
        <RowActions tenant={tenant} onOpen={openTab} />
      </div>
    </li>
  );
}
