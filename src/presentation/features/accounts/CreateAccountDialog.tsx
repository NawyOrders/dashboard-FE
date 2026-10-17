import { useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { en } from '@/presentation/i18n/en';
import { validateEmail, validateName } from '@/domain/rules/validation';
import { ROLE_REGISTRY } from '@/domain/rules/permissions';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useCreateAdminAccount } from '@/presentation/hooks/queries';
import { useToast } from '@/presentation/hooks/useToast';
import type { Role } from '@/domain/entities';

const ROLE_OPTIONS = (Object.keys(ROLE_REGISTRY) as Role[]).map((role) => ({
  value: role,
  label: ROLE_REGISTRY[role].label,
}));

export interface CreateAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAccountDialog({ open, onClose }: CreateAccountDialogProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const createAccount = useCreateAdminAccount();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('support');
  const [touched, setTouched] = useState({ name: false, email: false });

  const nameError = !touched.name
    ? undefined
    : name.trim().length === 0
      ? en.accounts.requiredName
      : (validateName(name, 'business') ?? undefined);

  const emailError = !touched.email
    ? undefined
    : email.trim().length === 0
      ? en.accounts.requiredEmail
      : (validateEmail(email) ?? undefined);

  function reset() {
    setName('');
    setEmail('');
    setRole('support');
    setTouched({ name: false, email: false });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true });
    if (name.trim().length === 0 || validateName(name, 'business')) return;
    if (email.trim().length === 0 || validateEmail(email)) return;

    createAccount.mutate(
      { input: { name: name.trim(), email: email.trim(), role }, actor: user! },
      {
        onSuccess: () => {
          toast({ title: en.accounts.createSuccess, variant: 'success' });
          reset();
          onClose();
        },
        onError: (error: Error) => {
          toast({ title: en.common.somethingWentWrong, description: error.message, variant: 'error' });
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={en.accounts.createTitle}
      description={en.accounts.createSubtitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {en.common.cancel}
          </Button>
          <Button form="create-account-form" type="submit" loading={createAccount.isPending}>
            {en.common.create}
          </Button>
        </>
      }
    >
      <form id="create-account-form" onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Input
          label={en.accounts.name}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={nameError}
          autoComplete="off"
        />
        <Input
          label={en.accounts.email}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
          autoComplete="off"
        />
        <Select
          label={en.accounts.role}
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          options={ROLE_OPTIONS}
        />
      </form>
    </Dialog>
  );
}
