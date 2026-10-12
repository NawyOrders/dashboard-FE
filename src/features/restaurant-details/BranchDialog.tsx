import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { en } from '@/i18n/en';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().min(3, 'Address is required'),
  phone: z.string().min(6, 'Phone is required'),
  status: z.enum(['active', 'pending', 'inactive']),
});

export type BranchFormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: 'active', label: en.status.branch.active },
  { value: 'pending', label: en.status.branch.pending },
  { value: 'inactive', label: en.status.branch.inactive },
];

export interface BranchDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: BranchFormValues) => void;
}

export function BranchDialog({ open, loading, onClose, onSubmit }: BranchDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(schema),
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
          options={STATUS_OPTIONS}
          {...register('status')}
        />
      </form>
    </Dialog>
  );
}