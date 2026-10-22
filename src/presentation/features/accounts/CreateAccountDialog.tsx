import { useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { Select } from '@/presentation/components/ui/Select';
import { en } from '@/presentation/i18n/en';
import { validateEmail, validateName } from '@/domain/rules/validation';
import { validatePassword } from '@/domain/rules/password';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

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

  const passwordError = !touched.password
    ? undefined
    : password.length === 0
      ? en.accounts.requiredPassword
      : (validatePassword(password) ?? undefined);

  const confirmPasswordError = !touched.confirmPassword
    ? undefined
    : confirmPassword.length === 0
      ? en.accounts.requiredConfirmPassword
      : password !== confirmPassword
        ? en.accounts.passwordMismatch
        : undefined;

  function reset() {
    setName('');
    setEmail('');
    setRole('support');
    setPassword('');
    setConfirmPassword('');
    setTouched({ name: false, email: false, password: false, confirmPassword: false });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (name.trim().length === 0 || validateName(name, 'business')) return;
    if (email.trim().length === 0 || validateEmail(email)) return;
    if (password.length === 0 || validatePassword(password)) return;
    if (password !== confirmPassword) return;

    createAccount.mutate(
      {
        input: { name: name.trim(), email: email.trim(), role, password },
        actor: user!,
      },
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
        <PasswordInput
          label={en.accounts.password}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
          hint={en.accounts.passwordHint}
          autoComplete="new-password"
        />
        <PasswordInput
          label={en.accounts.confirmPassword}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
          error={confirmPasswordError}
          autoComplete="new-password"
        />
      </form>
    </Dialog>
  );
}
