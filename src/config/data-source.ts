import { z } from 'zod';

const envSchema = z
  .object({
    VITE_DATA_SOURCE: z.enum(['static', 'api']).default('static'),
    VITE_API_BASE_URL: z.string().trim().default(''),
  })
  .superRefine((env, ctx) => {
    if (env.VITE_DATA_SOURCE === 'api' && env.VITE_API_BASE_URL === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VITE_API_BASE_URL'],
        message: 'VITE_API_BASE_URL must be set when VITE_DATA_SOURCE=api.',
      });
    }
  });

export type DataSourceEnv = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(import.meta.env);

const issues: string[] = parsed.success
  ? []
  : parsed.error.issues.map((issue) =>
      issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
    );

export const ENVIRONMENT_ISSUES: readonly string[] = issues;

/** Static fallback used only to keep imports safe; startup fails through `assertEnvironment`. */
export const DATA_SOURCE = parsed.success ? parsed.data.VITE_DATA_SOURCE : 'static';
export const API_BASE_URL = parsed.success ? parsed.data.VITE_API_BASE_URL : '';
export const IS_DEMO_PROVIDER = parsed.success && DATA_SOURCE === 'static';

/**
 * Reads the validated environment. Called before the data source is built so a missing
 * base URL in `api` mode stops the app with a readable message instead of failing later.
 */
export function assertEnvironment(): DataSourceEnv {
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${issues.join(' ')}`);
  }
  return parsed.data;
}
