import { z } from 'zod';
import { en } from '@/i18n';

export function createSignInSchema() {
  return z.object({
    email: z.string().trim().min(1, en.auth.emailRequired).email(en.auth.emailInvalid),
    password: z.string().min(1, en.auth.passwordRequired),
  });
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>;
