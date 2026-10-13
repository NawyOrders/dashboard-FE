import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { en } from '@/presentation/i18n/en';
import { INCLUDED_BRANCHES } from '@/config/policy';
import type { CreateRestaurantValues } from './schema';

export function BranchesStep({ form }: { form: UseFormReturn<CreateRestaurantValues> }) {
  const { register, control, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'branches' });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text">
          {en.create.branches.included(fields.length, INCLUDED_BRANCHES)}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append({ name: '', address: '', phone: '' })}
        >
          <Plus aria-hidden="true" className="size-4" />
          {en.create.branches.addBranch}
        </Button>
      </div>

      {fields.length > INCLUDED_BRANCHES && (
        <p className="rounded-panel bg-warning-bg px-4 py-3 text-2xs text-warning-fg">
          {en.create.branches.limitNote}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-4 rounded-panel border border-border p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start"
          >
            <Input
              label={en.create.branches.name}
              error={formState.errors.branches?.[index]?.name?.message}
              {...register(`branches.${index}.name` as const)}
            />
            <Input
              label={en.create.branches.address}
              error={formState.errors.branches?.[index]?.address?.message}
              {...register(`branches.${index}.address` as const)}
            />
            <Input
              label={en.create.branches.phone}
              error={formState.errors.branches?.[index]?.phone?.message}
              {...register(`branches.${index}.phone` as const)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-6 text-danger-fg"
              onClick={() => remove(index)}
              aria-label={`${en.create.branches.removeBranch} ${index + 1}`}
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </Button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-text-muted">{en.details.noBranches}</p>
        )}
      </div>
    </div>
  );
}