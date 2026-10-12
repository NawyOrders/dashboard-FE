import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from '@/hooks/queries';
import { api } from '@/services';
import { en } from '@/i18n/en';
import type { RestaurantStatus, Tenant } from '@/types';

const OPTIONS: { value: RestaurantStatus; label: string }[] = [
  { value: 'active', label: en.status.restaurant.active },
  { value: 'pending', label: en.status.restaurant.pending },
  { value: 'inactive', label: en.status.restaurant.inactive },
];

export function RestaurantStatusControl({ tenant }: { tenant: Tenant }) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { allowed } = usePermission('restaurant.edit');
  const [next, setNext] = useState<RestaurantStatus>(tenant.status);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.updateRestaurantStatus(tenant.id, next, user!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenant.id) });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      setConfirmOpen(false);
      toast({ title: en.toasts.updated, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: en.common.somethingWentWrong, description: error.message, variant: 'error' });
    },
  });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-40">
        <Select
          label={en.details.statuses}
          value={next}
          disabled={!allowed}
          onChange={(event) => setNext(event.target.value as RestaurantStatus)}
          options={OPTIONS}
        />
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={!allowed || next === tenant.status}
        onClick={() => setConfirmOpen(true)}
      >
        {en.common.save}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title={en.activity.actions.restaurant_status_changed}
        changes={[
          {
            label: en.confirm.title,
            previous: en.status.restaurant[tenant.status],
            next: en.status.restaurant[next],
          },
        ]}
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}