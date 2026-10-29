import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { en } from '@/presentation/i18n/en';
import { validateName, validatePhone } from '@/domain/rules/validation';

function createBranchSchema() {
  return z.object({
    name: z
      .string()
      .min(1, en.create.branches.nameRequired)
      .superRefine((value, ctx) => {
        const message = validateName(value, 'branch');
        if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      }),
    address: z.string().min(3, en.create.branches.addressRequired),
    phone: z
      .string()
      .min(1, en.create.branches.phoneRequired)
      .superRefine((value, ctx) => {
        const message = validatePhone(value);
        if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      }),
    status: z.enum(['active', 'pending', 'inactive']),
  });
}

export type BranchFormValues = z.infer<ReturnType<typeof createBranchSchema>>;

export interface BranchDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: BranchFormValues) => void;
}

export function BranchDialog({ open, loading, onClose, onSubmit }: BranchDialogProps) {
  const statusOptions = [
    { value: 'active', label: en.status.branch.active },
    { value: 'pending', label: en.status.branch.pending },
    { value: 'inactive', label: en.status.branch.inactive },
  ];
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(createBranchSchema()),
    mode: 'onTouched',
    defaultValues: { name: '', address: '', phone: '', status: 'active' },
  });

  function close() {
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={en.create.branches.addBranch}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={loading}>
            {en.common.cancel}
          </Button>
          <Button loading={loading} onClick={handleSubmit((values) => onSubmit(values))}>
            {en.create.branches.addBranch}
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => onSubmit(values))}
      >
        <Input
          label={en.create.branches.name}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={en.create.branches.address}
          error={errors.address?.message}
          {...register('address')}
        />
        <Input
          label={en.create.branches.phone}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Select
          label={en.create.branches.status}
          options={statusOptions}
          {...register('status')}
        />
      </form>
    </Dialog>
  );
}