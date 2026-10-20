import { useMemo, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { PermissionDenied } from '@/presentation/components/shared/PermissionDenied';
import { Button } from '@/presentation/components/ui/Button';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { en } from '@/presentation/i18n/en';
import { formatDate } from '@/domain/rules/date';
import { usePermission } from '@/presentation/hooks/usePermission';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useApplications } from '@/presentation/hooks/queries';
import { useToast } from '@/presentation/hooks/useToast';
import { restaurantStatusMeta } from '@/presentation/lib/status';
import type { Tenant } from '@/domain/entities';
import { ApplicationDialog } from './ApplicationDialog';

export function ApplicationsPage() {
  const { allowed } = usePermission('restaurant.create');
  useCurrentUser();
  const applicationsQuery = useApplications();
  useToast();
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<Tenant | null>(null);

  const rows = useMemo(() => {
    const all = applicationsQuery.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (tenant) =>
        tenant.restaurantName.toLowerCase().includes(needle) ||
        tenant.businessName.toLowerCase().includes(needle) ||
        tenant.tenantId.toLowerCase().includes(needle),
    );
  }, [applicationsQuery.data, search]);

  if (!allowed) {
    return (
      <div>
        <PageHeader title={en.applications.title} subtitle={en.applications.subtitle} />
        <PermissionDenied action="restaurant.create" />
      </div>
    );
  }

  // Approve handled in dialog

  return (
    <div>
      <PageHeader
        title={en.applications.title}
        subtitle={en.applications.subtitle}
        showDemoBadge
      />

      <div className="mt-4 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={en.applications.searchPlaceholder}
            aria-label={en.applications.searchPlaceholder}
            className="h-11 w-full rounded-panel border border-border bg-card ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {applicationsQuery.isLoading ? (
        <Skeleton className="mt-6 h-40 w-full" />
      ) : applicationsQuery.isError ? (
        <div className="mt-6">
          <ErrorState error={applicationsQuery.error} onRetry={() => void applicationsQuery.refetch()} />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={en.applications.tableEmpty} />
        </div>
      ) : (
          <div className="mt-6 overflow-x-auto rounded-card border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-2xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3 text-start font-medium">{en.applications.restaurant}</th>
                <th className="px-4 py-3 text-start font-medium">{en.applications.tenantId}</th>
                <th className="px-4 py-3 text-start font-medium">{en.applications.ownerEmail}</th>
                <th className="px-4 py-3 text-start font-medium">{en.applications.phone}</th>
                <th className="px-4 py-3 text-start font-medium">{en.applications.appliedOn}</th>
                <th className="px-4 py-3 text-start font-medium">{en.applications.status}</th>
                <th className="px-4 py-3 text-start font-medium">{en.applications.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tenant) => (
                <tr key={tenant.id} className="border-b border-border/60 last:border-b-0 hover:bg-bg-2/60">
                  <td className="px-4 py-3 font-medium text-text">{tenant.restaurantName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{tenant.tenantId}</td>
                  <td className="px-4 py-3 text-text-muted">{tenant.contact.email}</td>
                  <td className="px-4 py-3 text-text-muted">{tenant.contact.phone}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(tenant.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusPill meta={restaurantStatusMeta(tenant.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setViewing(tenant)}>
                        <Eye aria-hidden="true" className="size-4" />
                        {en.applications.view}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApplicationDialog
        tenant={viewing}
        onClose={() => setViewing(null)}
        onApproved={() => {
          setViewing(null);
          applicationsQuery.refetch();
        }}
        onDeleted={() => {
          setViewing(null);
          applicationsQuery.refetch();
        }}
      />
    </div>
  );
}
