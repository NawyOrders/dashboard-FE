import { z } from 'zod';
import type { MenuOcrPort } from '@/application/ports';
import type {
  MenuOcrResultPayload,
  MenuOcrStatus,
  MenuOcrSubmission,
} from '@/domain/entities';
import type { HttpClient } from './http-client';

/**
 * Menu OCR HTTP calls (swagger): submit the photo, read the job status, read the result.
 *
 * The envelope is unwrapped once by the shared HTTP client.
 * OPEN: confirm envelope with backend (the HTML plan uses value/error).
 *
 * The swagger marks these routes public, but the backend answers 401 without a
 * Bearer token, so every call goes through the authenticated client path.
 */

const MENU_OCR_PATH = 'api/v1/onboarding/menu-ocr';
const JOBS_PATH = 'api/v1/ai/jobs';

const nullableString = z
  .string()
  .nullish()
  .transform((value) => value ?? null);

const nullableNumber = z
  .number()
  .nullish()
  .transform((value) => value ?? null);

const jobType = z
  .string()
  .nullish()
  .transform((value) => value ?? '');

const jobStatus = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => (value === null || value === undefined ? '' : String(value)));

const submissionSchema: z.ZodType<Omit<MenuOcrSubmission, 'retryAfterSeconds'>, z.ZodTypeDef, unknown> =
  z.object({
    jobId: z.string(),
    jobType,
    status: jobStatus,
    estimatedSeconds: nullableNumber,
    statusUrl: nullableString,
    resultUrl: nullableString,
    submittedAtUtc: nullableString,
  });

const statusSchema: z.ZodType<MenuOcrStatus, z.ZodTypeDef, unknown> = z.object({
  jobId: z.string(),
  jobType,
  status: jobStatus,
  progressPercentage: nullableNumber,
  stage: nullableString,
  elapsedSeconds: nullableNumber,
  estimatedRemainingSeconds: nullableNumber,
  hasResult: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
  errorCode: nullableString,
  errorMessage: nullableString,
  createdAtUtc: nullableString,
  startedAtUtc: nullableString,
  completedAtUtc: nullableString,
});

const resultSchema: z.ZodType<MenuOcrResultPayload, z.ZodTypeDef, unknown> = z.object({
  jobId: z.string(),
  jobType,
  completedAtUtc: nullableString,
  durationSeconds: nullableNumber,
  data: z.custom<unknown>(),
});

/** `Retry-After` is either a number of seconds or an HTTP date. */
function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = Date.parse(value);
  if (Number.isNaN(date)) return null;
  return Math.max(0, Math.ceil((date - Date.now()) / 1_000));
}

export function createOcrApi(client: HttpClient): MenuOcrPort {
  return {
    async submit(file, signal) {
      const form = new FormData();
      form.append('image', file);

      let retryAfterSeconds: number | null = null;
      const submission = await client.request({
        path: MENU_OCR_PATH,
        method: 'POST',
        body: form,
        signal,
        expectedStatus: 202,
        onResponseHeaders: (headers) => {
          retryAfterSeconds = parseRetryAfter(headers.get('Retry-After'));
        },
        schema: submissionSchema,
      });

      return { ...submission, retryAfterSeconds };
    },

    getStatus(jobId, signal) {
      return client.request({
        path: `${JOBS_PATH}/${encodeURIComponent(jobId)}/status`,
        signal,
        schema: statusSchema,
      });
    },

    getResult(jobId, signal) {
      return client.request({
        path: `${JOBS_PATH}/${encodeURIComponent(jobId)}/result`,
        signal,
        schema: resultSchema,
      });
    },
  };
}
