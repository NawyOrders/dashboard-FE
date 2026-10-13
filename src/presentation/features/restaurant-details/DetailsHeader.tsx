import { ArrowLeft, Pencil, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/Button';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { CopyableId } from '@/presentation/components/shared/CopyableId';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { restaurantStatusMeta, subscriptionStatusMeta } from '@/presentation/lib/status';
import { usePermission } from '@/presentation/hooks/usePermission';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';

export interface DetailsHeaderProps {
  tenant: Tenant;
  onEditSubscription: () => void;
  onManageFeatures: () => void;
}

export function DetailsHeader({ tenant, onEditSubscription, onManageFeatures }: DetailsHeaderProps) {
  const canEditSubscription = usePermission('subscription.change').allowed;
  const canToggleFeature = usePermission('feature.toggle').allowed;

  return (
    <div className="mb-6">
      <Link
        to="/restaurants"
        className="mb-4 inline-flex items-center gap-1.5 text-2xs font-medium text-text-muted transition-colors duration-150 hover:text-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        {en.details.back}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <TenantLogo name={tenant.restaurantName} color={tenant.brandColors.primary} size="lg" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-text">{tenant.restaurantName}</h1>
            <p className="mt-0.5 text-sm text-text-muted">{tenant.businessName}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyableId value={tenant.tenantId} />
              <PackagePill code={tenant.subscription.packageCode} />
              <StatusPill meta={restaurantStatusMeta(tenant.status)} />
              <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {canToggleFeature ? (
            <Button variant="secondary" onClick={onManageFeatures}>
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              {en.common.manageFeatures}
            </Button>
          ) : (
            <Tooltip label={en.permissions.deniedAction}>
              <Button variant="secondary" disabled>
                <SlidersHorizontal aria-hidden="true" className="size-4" />
                {en.common.manageFeatures}
              </Button>
            </Tooltip>
          )}
          {canEditSubscription ? (
            <Button onClick={onEditSubscription}>
              <Pencil aria-hidden="true" className="size-4" />
              {en.common.editSubscription}
            </Button>
          ) : (
            <Tooltip label={en.permissions.deniedAction}>
              <Button disabled>
                <Pencil aria-hidden="true" className="size-4" />
                {en.common.editSubscription}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}