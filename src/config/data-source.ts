import { z } from 'zod';

const envSchema = z.object({
  VITE_DATA_SOURCE: z.enum(['static', 'api']).default('static'),
  VITE_API_BASE_URL: z.string().default(''),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid data-source environment: ${parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')}`,
  );
}

export const DATA_SOURCE = parsed.data.VITE_DATA_SOURCE;
export const API_BASE_URL = parsed.data.VITE_API_BASE_URL;
export const IS_DEMO_PROVIDER = DATA_SOURCE === 'static';
