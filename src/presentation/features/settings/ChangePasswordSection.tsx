import { useState } from 'react';
import { api } from '@/app/composition';
import { Button } from '@/presentation/components/ui/Button';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { en } from '@/presentation/i18n/en';
import { validatePassword } from '@/domain/rules/password';

export function ChangePasswordSection() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ current: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const currentError =
    !touched.current || currentPassword.length > 0
      ? undefined
      : en.settings.currentPasswordRequired;
  const newError = !touched.new
    ? undefined
    : newPassword.length === 0
      ? en.settings.newPasswordRequired
      : (validatePassword(newPassword) ?? undefined);
  const confirmError = !touched.confirm
    ? undefined
    : confirmPassword.length === 0
      ? en.settings.confirmPasswordRequired
      : newPassword !== confirmPassword
        ? en.settings.passwordMismatch
        : undefined;

  function reset() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTouched({ current: false, new: false, confirm: false });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ current: true, new: true, confirm: true });
    setFailure(null);
    if (!user) return;
    if (currentPassword.length === 0) return;
    if (validatePassword(newPassword)) return;
    if (newPassword !== confirmPassword) return;

    setSubmitting(true);
    try {
      await api.changeOwnPassword({ currentPassword, newPassword }, user);
      toast({ title: en.settings.passwordChanged, variant: 'success' });
      reset();
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'WrongCurrentPasswordError') {
        setFailure(en.settings.wrongCurrentPassword);
      } else if (name === 'PasswordPolicyError') {
        setFailure(en.settings.passwordPolicyFailed);
      } else {
        setFailure(en.settings.changePasswordFailed);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-card">
      <div className="border-b border-border p-5">
        <h2 className="text-sm font-semibold text-text">{en.settings.changePasswordTitle}</h2>
        <p className="mt-1 text-2xs text-text-muted">{en.settings.changePasswordSubtitle}</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4 p-5" noValidate>
        <PasswordInput
          label={en.settings.currentPassword}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          onBlur={() => setTouched((state) => ({ ...state, current: true }))}
          error={currentError}
          autoComplete="current-password"
        />
        <PasswordInput
          label={en.settings.newPassword}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          onBlur={() => setTouched((state) => ({ ...state, new: true }))}
          error={newError}
          hint={en.settings.passwordPolicyHint}
          autoComplete="new-password"
        />
        <PasswordInput
          label={en.settings.confirmPassword}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          onBlur={() => setTouched((state) => ({ ...state, confirm: true }))}
          error={confirmError}
          autoComplete="new-password"
        />
        {failure ? <p className="text-2xs text-error">{failure}</p> : null}
        <div className="flex justify-end">
          <Button type="submit" loading={submitting}>
            {en.settings.changePasswordAction}
          </Button>
        </div>
      </form>
    </div>
  );
}
