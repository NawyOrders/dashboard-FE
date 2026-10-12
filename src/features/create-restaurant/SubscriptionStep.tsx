import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PackageCards } from '@/components/shared/PackageCards';
import { DurationSegmented } from '@/components/shared/DurationSegmented';
import { en } from '@/i18n/en';
import { endDateFromDuration } from '@/lib/subscription';
import type { CreateRestaurantValues } from './schema';

const STATUS_OPTIONS = [
  { value: 'active', label: en.status.restaurant.active },
  { value: 'pending', label: en.status.restaurant.pending },
  { value: 'inactive', label: en.status.restaurant.inactive },
];

export function SubscriptionStep({ form }: { form: UseFormReturn<CreateRestaurantValues> }) {
  const { register, setValue, watch, formState } = form;
  const packageCode = watch('packageCode');
  const durationMonths = watch('durationMonths');
  const startDate = watch('startDate');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-2xs font-medium text-text">{en.create.subscription.package}</span>
        <PackageCards value={packageCode} onChange={(code) => setValue('packageCode', code)} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-2xs font-medium text-text">{en.create.subscription.duration}</span>
        <DurationSegmented
          value={durationMonths}
          onChange={(months) => {
            setValue('durationMonths', months, { shouldValidate: true });
            setValue('endDate', endDateFromDuration(startDate, months), { shouldValidate: true });
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label={en.create.subscription.restaurantStatus}
          options={STATUS_OPTIONS}
          {...register('status')}
        />
        <Input
          label={en.create.subscription.startDate}
          type="date"
          error={formState.errors.startDate?.message}
          {...register('startDate')}
          onChange={(event) => {
            setValue('startDate', event.target.value);
            setValue('endDate', endDateFromDuration(event.target.value, durationMonths), {
              shouldValidate: true,
            });
          }}
        />
        <Input
          label={en.create.subscription.endDate}
          type="date"
          error={formState.errors.endDate?.message}
          {...register('endDate')}
        />
      </div>
      <p className="text-2xs text-text-muted">{en.editSubscription.subtitle}</p>
    </div>
  );
}