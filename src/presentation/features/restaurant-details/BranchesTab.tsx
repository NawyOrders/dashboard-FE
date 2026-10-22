import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { branchStatusMeta } from '@/presentation/lib/status';
import { usePermission } from '@/presentation/hooks/usePermission';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { queryKeys } from '@/presentation/hooks/queries';
import { api } from '@/app/composition';
import { INCLUDED_BRANCHES } from '@/config/policy';
import { PACKAGES } from '@/config/packages';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';
import { BranchDialog } from './BranchDialog';
import type { BranchFormValues } from './BranchDialog';

export function BranchesTab({ tenant }: { tenant: Tenant }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { allowed } = usePermission('restaurant.edit');

  const mutation = useMutation({
    mutationFn: (values: BranchFormValues) => api.addBranch(tenant.id, values, user!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenant.id) });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      setDialogOpen(false);
      toast({ title: en.toasts.updated, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: en.common.somethingWentWrong, description: error.message, variant: 'error' });
    },
  });

  const overIncluded = tenant.branches.length > INCLUDED_BRANCHES;

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-xl font-semibold">{en.create.branches.title}</h3>
          <p className="mt-1 text-2xs text-text-muted">
            {en.create.branches.included(tenant.branches.length, INCLUDED_BRANCHES)}
          </p>
        </div>
        {allowed ? (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            {en.create.branches.addBranch}
          </Button>
        ) : (
          <Tooltip label={en.permissions.deniedAction}>
            <Button disabled>
              <Plus aria-hidden="true" className="size-4" />
              {en.create.branches.addBranch}
            </Button>
          </Tooltip>
        )}
      </CardHeader>

      <CardBody className="pt-0">
        {overIncluded && (
          <p className="mb-4 rounded-panel bg-warning-bg px-4 py-3 text-2xs text-warning-fg">
            {en.create.branches.limitNote(PACKAGES[tenant.subscription.packageCode].branchLimits.max)}
          </p>
        )}

        {tenant.branches.length === 0 ? (
          <EmptyState title={en.details.noBranches} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">{en.create.branches.title}</caption>
              <thead>
                <tr className="border-y border-border text-2xs font-medium text-text-muted">
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.name}</th>
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.address}</th>
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.phone}</th>
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.status}</th>
                </tr>
              </thead>
              <tbody>
                {tenant.branches.map((branch) => (
                  <tr key={branch.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-text">{branch.name}</td>
                    <td className="px-4 py-4 text-text-muted">{branch.address}</td>
                    <td className="tabular whitespace-nowrap px-4 py-4 text-text-muted">{branch.phone}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusPill meta={branchStatusMeta(branch.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      <BranchDialog
        open={dialogOpen}
        loading={mutation.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </Card>
  );
}