import { useState } from 'react';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { en } from '@/presentation/i18n/en';
import { validatePassword } from '@/domain/rules/password';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useResetTenantAccountPassword } from '@/presentation/hooks/queries';
import { useToast } from '@/presentation/hooks/useToast';

export interface ResetTenantPasswordDialogProps {
  accountId: string | null;
  accountLabel: string | null;
  onClose: () => void;
}

/**
 * NW-247: a Super Admin sets a new password for a tenant account. The old password
 * stops working as soon as the reset is saved.
 */
export function ResetTenantPasswordDialog({
  accountId,
  accountLabel,
  onClose,
}: ResetTenantPasswordDialogProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const resetPassword = useResetTenantAccountPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });

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
    setPassword('');
    setConfirmPassword('');
    setTouched({ password: false, confirmPassword: false });
  }

  function close() {
    reset();
    onClose();
  }

  function confirm() {
    setTouched({ password: true, confirmPassword: true });
    if (!user || !accountId) return;
    if (password.length === 0 || validatePassword(password)) return;
    if (password !== confirmPassword) return;

    resetPassword.mutate(
      { input: { accountId, newPassword: password }, actor: user },
      {
        onSuccess: () => {
          toast({ title: en.accounts.tenantPasswordReset, variant: 'success' });
          close();
        },
        onError: (error: Error) => {
          toast({ title: en.common.somethingWentWrong, description: error.message, variant: 'error' });
        },
      },
    );
  }

  return (
    <ConfirmDialog
      open={accountId !== null}
      title={en.accounts.resetTenantPasswordTitle}
      body={en.accounts.resetTenantPasswordBody(accountLabel ?? '')}
      confirmLabel={en.accounts.resetTenantPasswordAction}
      cancelLabel={en.common.cancel}
      loading={resetPassword.isPending}
      onCancel={close}
      onConfirm={confirm}
    >
      <div className="flex flex-col gap-3">
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
      </div>
    </ConfirmDialog>
  );
}
