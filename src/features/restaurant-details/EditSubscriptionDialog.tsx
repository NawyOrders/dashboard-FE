import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Change } from '@/components/ui/ConfirmDialog';
import { PackageCards } from '@/components/shared/PackageCards';
import { DurationSegmented } from '@/components/shared/DurationSegmented';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from '@/hooks/queries';
import { api } from '@/services';
import type { UpdateSubscriptionInput } from '@/services/api';
import { endDateFromDuration } from '@/lib/subscription';
import { PACKAGES } from '@/config/packages';
import { en } from '@/i18n/en';
import { cn } from '@/lib/cn';
import type { Tenant } from '@/types';

const schema = z.object({
  packageCode: z.enum(['start', 'growth']),
  durationMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
  status: z.enum(['active', 'expiring_soon', 'expired', 'not_started']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'Expiry date is required'),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: 'active', label: en.status.subscription.active },
  { value: 'expiring_soon', label: en.status.subscription.expiring_soon },
  { value: 'expired', label: en.status.subscription.expired },
  { value: 'not_started', label: en.status.subscription.not_started },
];

export interface EditSubscriptionDialogProps {
  tenant: Tenant;
  open: boolean;
  onClose: () => void;
}

export function EditSubscriptionDialog({ tenant, open, onClose }: EditSubscriptionDialogProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<FormValues | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      packageCode: tenant.subscription.packageCode,
      durationMonths: tenant.subscription.durationMonths,
      status: tenant.subscription.status,
      startDate: tenant.subscription.startDate,
      endDate: tenant.subscription.endDate,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        packageCode: tenant.subscription.packageCode,
        durationMonths: tenant.subscription.durationMonths,
        status: tenant.subscription.status,
        startDate: tenant.subscription.startDate,
        endDate: tenant.subscription.endDate,
      });
      setPending(null);
    }
  }, [open, tenant, reset]);

  const packageCode = watch('packageCode');
  const durationMonths = watch('durationMonths');
  const startDate = watch('startDate');

  const mutation = useMutation({
    mutationFn: (values: UpdateSubscriptionInput) => api.updateSubscription(tenant.id, values, user!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenant.id) });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['flags', tenant.id] });
      setPending(null);
      onClose();
      toast({ title: en.editSubscription.success, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: en.common.somethingWentWrong, description: error.message, variant: 'error' });
    },
  });

  const changes = useMemo<Change[]>(() => {
    if (!pending) return [];
    const list: Change[] = [];
    if (pending.packageCode !== tenant.subscription.packageCode) {
      list.push({
        label: en.editSubscription.package,
        previous: PACKAGES[tenant.subscription.packageCode].name,
        next: PACKAGES[pending.packageCode].name,
      });
    }
    if (pending.durationMonths !== tenant.subscription.durationMonths) {
      list.push({
        label: en.editSubscription.duration,
        previous: en.details.months(tenant.subscription.durationMonths),
        next: en.details.months(pending.durationMonths),
      });
    }
    if (pending.status !== tenant.subscription.status) {
      list.push({
        label: en.editSubscription.status,
        previous: en.status.subscription[tenant.subscription.status],
        next: en.status.subscription[pending.status],
      });
    }
    if (pending.startDate !== tenant.subscription.startDate) {
      list.push({ label: en.editSubscription.startDate, previous: tenant.subscription.startDate, next: pending.startDate });
    }
    if (pending.endDate !== tenant.subscription.endDate) {
      list.push({ label: en.editSubscription.endDate, previous: tenant.subscription.endDate, next: pending.endDate });
    }
    return list;
  }, [pending, tenant]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={en.editSubscription.title}
        description={en.editSubscription.subtitle}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              {en.common.cancel}
            </Button>
            <Button onClick={handleSubmit((values) => setPending(values))}>{en.common.save}</Button>
          </>
        }
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit((values) => setPending(values))}>
          <div className="flex flex-col gap-2">
            <span className="text-2xs font-medium text-text">{en.editSubscription.package}</span>
            <PackageCards value={packageCode} onChange={(code) => setValue('packageCode', code)} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-2xs font-medium text-text">{en.editSubscription.duration}</span>
            <DurationSegmented
              value={durationMonths}
              onChange={(months) => {
                setValue('durationMonths', months, { shouldValidate: true });
                setValue('endDate', endDateFromDuration(startDate, months), { shouldValidate: true });
              }}
            />
          </div>

          <div className={cn('grid grid-cols-1 gap-4', 'sm:grid-cols-3')}>
            <Select
              label={en.editSubscription.status}
              options={STATUS_OPTIONS}
              {...register('status')}
            />
            <Input label={en.editSubscription.startDate} type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label={en.editSubscription.endDate} type="date" error={errors.endDate?.message} {...register('endDate')} />
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={pending !== null}
        title={en.editSubscription.title}
        changes={changes}
        body={changes.length === 0 ? 'No changes to save.' : undefined}
        loading={mutation.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) mutation.mutate(pending);
        }}
      />
    </>
  );
}
