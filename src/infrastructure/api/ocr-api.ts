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

const submissionSchema: z.ZodType<MenuOcrSubmission, z.ZodTypeDef, unknown> = z.object({
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

export function createOcrApi(client: HttpClient): MenuOcrPort {
  return {
    submit(file, options) {
      const form = new FormData();
      form.append('image', file);

      return client.request({
        path: MENU_OCR_PATH,
        method: 'POST',
        query: { referenceId: options?.referenceId ?? undefined },
        body: form,
        signal: options?.signal,
        expectedStatus: 202,
        schema: submissionSchema,
      });
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
