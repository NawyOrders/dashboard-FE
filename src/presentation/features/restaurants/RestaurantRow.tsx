import { ClipboardList, CreditCard, Eye, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/presentation/components/ui/Checkbox';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { DropdownMenu } from '@/presentation/components/ui/DropdownMenu';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { ChannelCell } from '@/presentation/components/shared/ChannelCell';
import { AppsCell } from '@/presentation/components/shared/AppsCell';
import { ExpiryDate } from '@/presentation/components/shared/ExpiryDate';
import { RestaurantName } from '@/presentation/components/shared/RestaurantName';
import { restaurantStatusMeta, subscriptionStatusMeta } from '@/presentation/lib/status';
import { formatDate } from '@/domain/rules/date';
import { usePermission } from '@/presentation/hooks/usePermission';
import { INCLUDED_BRANCHES } from '@/config/policy';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import type { Tenant } from '@/domain/entities';

export interface RestaurantRowProps {
  tenant: Tenant;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function RestaurantRow({ tenant, selected, onToggle }: RestaurantRowProps) {
  const navigate = useNavigate();
  const canEdit = usePermission('subscription.change').allowed;
  const canToggleFeature = usePermission('feature.toggle').allowed;

  const stickyCell = cn('sticky z-10', selected ? 'bg-bg-2' : 'bg-card group-hover:bg-bg-2');
  const cell = cn('px-4 py-4 align-middle', selected ? 'bg-bg-2' : 'group-hover:bg-bg-2');

  const openTab = (tab: string) => navigate(`/restaurants/${tenant.id}?tab=${tab}`);

  return (
    <tr className="group border-b border-border last:border-0">
      <td className={cn(stickyCell, 'start-0 w-12 ps-4')}>
        <Checkbox
          checked={selected}
          onChange={() => onToggle(tenant.id)}
          aria-label={en.common.selectRestaurantRow(tenant.restaurantName)}
        />
      </td>
      <td className={cn(stickyCell, 'start-12 min-w-[240px] pe-4')}>
        <div className="flex items-center gap-3">
          <TenantLogo name={tenant.restaurantName} color={tenant.brandColors.primary} />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => openTab('overview')}
              title={tenant.restaurantName}
              className="block max-w-[220px] text-start"
            >
              <RestaurantName
                name={tenant.restaurantName}
                nameAr={tenant.restaurantNameAr}
                primaryClassName="text-sm font-semibold text-text hover:text-primary"
                secondaryClassName="text-2xs text-text-muted"
              />
            </button>
            <span className="block max-w-[220px] truncate text-2xs text-text-muted" title={tenant.businessName}>
              {tenant.businessName}
            </span>
          </div>
        </div>
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <span className="font-mono text-mono text-text-muted">{tenant.tenantId}</span>
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <PackagePill code={tenant.subscription.packageCode} />
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <StatusPill meta={restaurantStatusMeta(tenant.status)} />
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
      </td>
      <td className={cn(cell, 'tabular whitespace-nowrap text-text-muted')}>
        {formatDate(tenant.subscription.startDate)}
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <ExpiryDate endDate={tenant.subscription.endDate} />
      </td>
      <td className={cn(cell, 'tabular whitespace-nowrap text-text-muted')}>
        {tenant.branches.length} / {INCLUDED_BRANCHES}
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <ChannelCell websiteStatus={tenant.channels.websiteStatus} pwaStatus={tenant.channels.pwaStatus} />
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        <AppsCell android={tenant.apps.android} ios={tenant.apps.ios} />
      </td>
      <td className={cn(cell, 'whitespace-nowrap pe-4')}>
        <DropdownMenu
          label={en.common.actionsFor(tenant.restaurantName)}
          items={[
            {
              key: 'view',
              label: en.common.viewDetails,
              icon: <Eye aria-hidden="true" className="size-4" />,
              onSelect: () => openTab('overview'),
            },
            {
              key: 'subscription',
              label: en.common.editSubscription,
              icon: <CreditCard aria-hidden="true" className="size-4" />,
              disabled: !canEdit,
              disabledReason: en.permissions.deniedAction,
              onSelect: () => openTab('subscription'),
            },
            {
              key: 'features',
              label: en.common.manageFeatures,
              icon: <SlidersHorizontal aria-hidden="true" className="size-4" />,
              disabled: !canToggleFeature,
              disabledReason: en.permissions.deniedAction,
              onSelect: () => openTab('features'),
            },
            {
              key: 'activity',
              label: en.common.activityLog,
              icon: <ClipboardList aria-hidden="true" className="size-4" />,
              onSelect: () => openTab('activity'),
            },
          ]}
        />
      </td>
    </tr>
  );
}