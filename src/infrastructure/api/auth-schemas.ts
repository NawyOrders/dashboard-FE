import { z } from 'zod';

/** `LoginResponse` of POST /api/v1/auth/login, unwrapped from the `ApiResponse` envelope. */
export const loginResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().min(1),
  fullName: z.string().min(1),
  roles: z
    .array(z.string())
    .nullish()
    .transform((roles) => roles ?? []),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  tokenType: z.string().nullish(),
  expiresAtUtc: z.string().min(1),
  refreshTokenExpiresAtUtc: z.string().min(1),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
