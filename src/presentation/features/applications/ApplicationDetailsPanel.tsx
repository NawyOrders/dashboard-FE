import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { en } from '@/presentation/i18n/en';
import { formatDate, formatDateTime } from '@/domain/rules/date';
import { paymentStatusMeta, restaurantStatusMeta } from '@/presentation/lib/status';
import type { Tenant } from '@/domain/entities';

function useIsWideScreen() {
  const [isWide, setIsWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const onChange = () => setIsWide(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return isWide;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-2xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{children}</dd>
    </div>
  );
}

/** Read-only application details: side panel at ≥1280px, centered dialog below. */
export function ApplicationDetailsPanel({
  tenant,
  onClose,
}: {
  tenant: Tenant | null;
  onClose: () => void;
}) {
  const isWide = useIsWideScreen();

  useEffect(() => {
    if (!tenant || isWide) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [tenant, isWide, onClose]);

  if (!tenant) return null;

  const details = (
    <dl className="flex flex-col gap-4">
      <Field label={en.applications.restaurant}>{tenant.restaurantName}</Field>
      <Field label={en.applications.restaurantNameAr}>
        <span dir="rtl">{tenant.restaurantNameAr || en.common.notAvailable}</span>
      </Field>
      <Field label={en.applications.businessName}>{tenant.businessName}</Field>
      <Field label={en.applications.tenantId}>
        <span className="font-mono text-xs">{tenant.tenantId}</span>
      </Field>
      <Field label={en.applications.ownerEmail}>{tenant.contact.email}</Field>
      <Field label={en.applications.phone}>{tenant.contact.phone}</Field>
      <Field label={en.applications.branchCount}>{tenant.branches.length}</Field>
      <Field label={en.applications.submittedAt}>
        {formatDateTime(tenant.submittedAtUtc ?? tenant.createdAt)}
      </Field>
      <Field label={en.applications.appliedOn}>{formatDate(tenant.createdAt)}</Field>
      <Field label={en.applications.package}>
        <PackagePill code={tenant.subscription.packageCode} />
      </Field>
      <Field label={en.applications.payment}>
        {tenant.paymentStatus ? (
          <StatusPill meta={paymentStatusMeta(tenant.paymentStatus)} />
        ) : (
          en.common.notAvailable
        )}
      </Field>
      <Field label={en.applications.subscriptionDates}>
        {formatDate(tenant.subscription.startDate)} – {formatDate(tenant.subscription.endDate)}
      </Field>
      <Field label={en.applications.status}>
        <StatusPill meta={restaurantStatusMeta(tenant.status)} />
      </Field>
    </dl>
  );

  if (isWide) {
    return (
      <>
        <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={en.applications.viewTitle}
          className="fixed inset-y-0 end-0 z-50 flex w-[min(92vw,440px)] flex-col border-s border-border bg-card"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border p-6">
            <h2 className="text-lg font-semibold text-text">{en.applications.viewTitle}</h2>
            <button
              type="button"
              aria-label={en.common.close}
              onClick={onClose}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-panel text-text-muted transition-colors duration-150 hover:bg-bg-2 hover:text-text"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{details}</div>
        </aside>
      </>
    );
  }

  return (
    <Dialog open onClose={onClose} title={en.applications.viewTitle} size="lg">
      {details}
    </Dialog>
  );
}
