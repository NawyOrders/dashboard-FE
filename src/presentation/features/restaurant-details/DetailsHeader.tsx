import { ArrowLeft, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/Button';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { CopyableId } from '@/presentation/components/shared/CopyableId';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { paymentStatusMeta, restaurantStatusMeta, subscriptionStatusMeta } from '@/presentation/lib/status';
import { usePermission } from '@/presentation/hooks/usePermission';
import { isTenantProvisioned } from '@/domain/rules/tenant-provisioning';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';

export interface DetailsHeaderProps {
  tenant: Tenant;
  onEdit: () => void;
}

export function DetailsHeader({ tenant, onEdit }: DetailsHeaderProps) {
  const canEdit = usePermission('restaurant.edit').allowed;
  const editable = canEdit && !isTenantProvisioned(tenant);

  return (
    <div className="mb-6">
      <Link
        to="/restaurants"
        className="mb-4 inline-flex items-center gap-1.5 text-2xs font-medium text-text-muted transition-colors duration-150 hover:text-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5 rtl:rotate-180" />
        {en.details.back}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <TenantLogo name={tenant.restaurantName} color={tenant.brandColors.primary} size="lg" />
          <div className="min-w-0">
            <h1 dir="ltr" className="text-start text-2xl font-semibold text-text">
              {tenant.restaurantName}
            </h1>
            {tenant.restaurantNameAr ? (
              <p dir="rtl" className="mt-0.5 text-sm text-text-muted">
                {tenant.restaurantNameAr}
              </p>
            ) : null}
            <p className="mt-0.5 text-sm text-text-muted">{tenant.businessName}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyableId value={tenant.tenantId} />
              <PackagePill code={tenant.subscription.packageCode} />
              <StatusPill meta={restaurantStatusMeta(tenant.status)} />
              <StatusPill meta={subscriptionStatusMeta(tenant.subscription.status)} />
              {tenant.paymentStatus ? <StatusPill meta={paymentStatusMeta(tenant.paymentStatus)} /> : null}
            </div>
          </div>
        </div>

        {editable ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button onClick={onEdit}>
              <Pencil aria-hidden="true" className="size-4" />
              {en.details.editTenant}
            </Button>
          </div>
        ) : canEdit ? (
          <Tooltip label={en.details.provisionedReadOnly}>
            <Button disabled>
              <Pencil aria-hidden="true" className="size-4" />
              {en.details.editTenant}
            </Button>
          </Tooltip>
        ) : (
          <Tooltip label={en.permissions.deniedAction}>
            <Button disabled>
              <Pencil aria-hidden="true" className="size-4" />
              {en.details.editTenant}
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
