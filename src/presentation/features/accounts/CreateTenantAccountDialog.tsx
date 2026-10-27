import { useMemo, useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { Select } from '@/presentation/components/ui/Select';
import { en } from '@/presentation/i18n/en';
import { validateEmail } from '@/domain/rules/validation';
import { validatePassword } from '@/domain/rules/password';
import { RESTAURANT_ROLES } from '@/config/restaurant-roles';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useCreateTenantAccount, useTenants } from '@/presentation/hooks/queries';
import { useToast } from '@/presentation/hooks/useToast';
import { tenantRoleLabel } from '@/presentation/lib/role-copy';
import type { RestaurantRole } from '@/domain/entities';

export interface CreateTenantAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTenantAccountDialog({ open, onClose }: CreateTenantAccountDialogProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const tenantsQuery = useTenants();
  const createAccount = useCreateTenantAccount();

  const [tenantId, setTenantId] = useState('');
  const [restaurantRole, setRestaurantRole] = useState<RestaurantRole>('cashier');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    restaurant: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const roleOptions = RESTAURANT_ROLES.map((role) => ({
    value: role.id,
    label: tenantRoleLabel(role.id),
  }));

  const restaurantOptions = useMemo(
    () =>
      (tenantsQuery.data ?? []).map((tenant) => ({
        value: tenant.id,
        label: `${tenant.restaurantName} (${tenant.tenantId})`,
      })),
    [tenantsQuery.data],
  );

  const restaurantError = !touched.restaurant
    ? undefined
    : tenantId === ''
      ? en.accounts.requiredRestaurant
      : undefined;
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
    setTenantId('');
    setRestaurantRole('cashier');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTouched({ restaurant: false, email: false, password: false, confirmPassword: false });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ restaurant: true, email: true, password: true, confirmPassword: true });
    if (tenantId === '') return;
    if (email.trim().length === 0 || validateEmail(email)) return;
    if (password.length === 0 || validatePassword(password)) return;
    if (password !== confirmPassword) return;

    createAccount.mutate(
      {
        input: { tenantId, restaurantRole, email: email.trim(), password },
        actor: user!,
      },
      {
        onSuccess: () => {
          toast({ title: en.accounts.tenantAccountCreated, variant: 'success' });
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
      title={en.accounts.createTenantAccountTitle}
      description={en.accounts.createTenantAccountSubtitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {en.common.cancel}
          </Button>
          <Button form="create-tenant-account-form" type="submit" loading={createAccount.isPending}>
            {en.common.create}
          </Button>
        </>
      }
    >
      <form id="create-tenant-account-form" onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Select
          label={en.accounts.restaurant}
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, restaurant: true }))}
          error={restaurantError}
          options={restaurantOptions}
          placeholder={en.accounts.selectRestaurant}
        />
        <Select
          label={en.accounts.restaurantRole}
          value={restaurantRole}
          onChange={(event) => setRestaurantRole(event.target.value as RestaurantRole)}
          options={roleOptions}
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
