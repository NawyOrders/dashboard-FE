import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { PermissionDenied } from '@/presentation/components/shared/PermissionDenied';
import { Button } from '@/presentation/components/ui/Button';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { en } from '@/presentation/i18n/en';
import { formatDate } from '@/domain/rules/date';
import { ROLE_REGISTRY } from '@/domain/rules/permissions';
import { usePermission } from '@/presentation/hooks/usePermission';
import { useAdminAccounts } from '@/presentation/hooks/queries';
import { adminAccountStatusMeta } from '@/presentation/lib/status';
import type { InternalAccount } from '@/domain/entities';
import { CreateAccountDialog } from './CreateAccountDialog';
import { RolesSection } from './RolesSection';
import { TenantAccountsSection } from './TenantAccountsSection';

function roleLabel(role: InternalAccount['role']): string {
  return ROLE_REGISTRY[role].label;
}

export function AccountsPage() {
  const { allowed } = usePermission('accounts.view');
  const canCreate = usePermission('account.create').allowed;
  const accountsQuery = useAdminAccounts();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = useMemo(() => {
    const all = accountsQuery.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (account) =>
        account.name.toLowerCase().includes(needle) ||
        account.email.toLowerCase().includes(needle) ||
        roleLabel(account.role).toLowerCase().includes(needle),
    );
  }, [accountsQuery.data, search]);

  if (!allowed) {
    return (
      <div>
        <PageHeader title={en.accounts.title} subtitle={en.accounts.subtitle} />
        <PermissionDenied action="accounts.view" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={en.accounts.title}
        subtitle={en.accounts.subtitle}
        actions={
          canCreate ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              {en.accounts.createAccount}
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-card border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
          <div className="relative min-w-[200px] flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={en.accounts.searchPlaceholder}
              aria-label={en.accounts.searchPlaceholder}
              className="h-11 w-full rounded-panel border border-border bg-card ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {accountsQuery.isLoading ? (
          <div className="flex flex-col gap-3 p-5" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : accountsQuery.isError ? (
          <div className="p-5">
            <ErrorState error={accountsQuery.error} onRetry={() => void accountsQuery.refetch()} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={en.accounts.tableEmpty} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">{en.accounts.title}</caption>
              <thead>
                <tr className="border-b border-border text-2xs font-medium text-text-muted">
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">{en.accounts.name}</th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">{en.accounts.role}</th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">{en.accounts.status}</th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">{en.accounts.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((account) => (
                  <tr key={account.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <span className="block font-medium text-text">{account.name}</span>
                      <span className="block text-2xs text-text-muted">{account.email}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-text">{roleLabel(account.role)}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusPill meta={adminAccountStatusMeta(account.status)} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-text-muted">
                      {formatDate(account.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TenantAccountsSection />

      <RolesSection />

      {canCreate && (
        <CreateAccountDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      )}
    </div>
  );
}
