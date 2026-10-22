import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { usePermission } from '@/presentation/hooks/usePermission';
import { useTenantAccounts } from '@/presentation/hooks/queries';
import { en } from '@/presentation/i18n/en';
import { formatDate } from '@/domain/rules/date';
import { tenantRoleLabel } from '@/config/restaurant-roles';
import { CreateTenantAccountDialog } from './CreateTenantAccountDialog';

/**
 * NW-247: the accounts of the restaurants. They are listed with their restaurant, their
 * role, their email and the date they were created. A tenant account never signs in to
 * this dashboard.
 */
export function TenantAccountsSection() {
  const canCreate = usePermission('tenantAccount.create').allowed;
  const accountsQuery = useTenantAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = accountsQuery.data ?? [];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text">{en.accounts.tenantAccountsTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">{en.accounts.tenantAccountsSubtitle}</p>
        </div>
        {canCreate ? (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            {en.accounts.createTenantAccount}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 rounded-card border border-border bg-card">
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
          <EmptyState title={en.accounts.tenantAccountsEmpty} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">{en.accounts.tenantAccountsTitle}</caption>
              <thead>
                <tr className="border-b border-border text-2xs font-medium text-text-muted">
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">
                    {en.accounts.restaurant}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">
                    {en.accounts.restaurantRole}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">
                    {en.accounts.email}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start">
                    {en.accounts.createdAt}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((account) => (
                  <tr key={account.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <span className="block font-medium text-text">{account.restaurantName}</span>
                      <span className="block text-2xs text-text-muted">{account.tenantId}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-text">
                      {tenantRoleLabel(account.restaurantRole)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-text">{account.email}</td>
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

      {canCreate && (
        <CreateTenantAccountDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      )}
    </section>
  );
}
