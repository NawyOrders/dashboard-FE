import type { Tenant } from '@/domain/entities';
import { formatDateTime } from '@/domain/rules/date';
import { en } from '@/presentation/i18n/en';

export interface ApplicationAuditSectionProps {
  tenant: Tenant;
}

function timestamp(value: string | null | undefined): string {
  return value ? formatDateTime(value) : en.common.notAvailable;
}

function actor(value: string | null | undefined): string {
  return value || en.common.notAvailable;
}

/**
 * Payment and decision audit fields from the onboarding details. Every value is shown;
 * a request that was not decided yet renders the fields empty.
 */
export function ApplicationAuditSection({ tenant }: ApplicationAuditSectionProps) {
  const rows = [
    { label: en.applications.audit.paidAt, value: timestamp(tenant.paidAtUtc) },
    { label: en.applications.audit.paidChangedBy, value: actor(tenant.paidChangedBy) },
    { label: en.applications.audit.approvedAt, value: timestamp(tenant.approvedAtUtc) },
    { label: en.applications.audit.approvedBy, value: actor(tenant.approvedBy) },
    { label: en.applications.audit.rejectedAt, value: timestamp(tenant.rejectedAtUtc) },
    { label: en.applications.audit.rejectedBy, value: actor(tenant.rejectedBy) },
    { label: en.applications.audit.rejectionReason, value: actor(tenant.rejectionReason) },
  ];

  return (
    <section className="flex flex-col gap-3" aria-label={en.applications.audit.title}>
      <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-muted">
        {en.applications.audit.title}
      </h4>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <dt className="text-2xs font-medium text-text">{row.label}</dt>
            <dd className="break-words text-sm text-text-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
