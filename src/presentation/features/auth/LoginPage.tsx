import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { createSignInSchema, type SignInFormValues } from '@/domain/rules/auth-schema';
import { platformAuthErrorMessage } from '@/domain/rules/platform-auth';
import { useAuth } from '@/presentation/hooks/useAuth';
import { en } from '@/presentation/i18n/en';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(createSignInSchema()),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: SignInFormValues) {
    setFormError(null);
    try {
      const result = await signIn(values.email, values.password);
      if (!result.ok) {
        setFormError(platformAuthErrorMessage(result.error.extensions.code));
        return;
      }
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect, { replace: true });
    } catch {
      setFormError(platformAuthErrorMessage(undefined));
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-6 shadow-none">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-text">{en.auth.title}</h1>
          <p className="mt-1 text-sm text-text-muted">{en.auth.subtitle}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-text">
              {en.auth.email}
            </label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? <p className="mt-1 text-xs text-error">{errors.email.message}</p> : null}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-text">
              {en.auth.password}
            </label>
            <PasswordInput id="password" autoComplete="current-password" {...register('password')} />
            {errors.password ? <p className="mt-1 text-xs text-error">{errors.password.message}</p> : null}
          </div>
          {formError ? <p className="text-sm text-error">{formError}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? en.auth.signingIn : en.auth.signIn}
          </Button>
        </form>
      </div>
    </div>
  );
}
