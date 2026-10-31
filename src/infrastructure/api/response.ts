import { z } from 'zod';

/**
 * The one place that reads the backend response wrapper.
 *
 * Every endpoint answers with `ApiResponse { statusCode, isSuccess, data, errors,
 * timestamp }`. Callers get the `data` value and never inspect the wrapper.
 */

const apiEnvelopeSchema = z.object({
  statusCode: z.number().int(),
  isSuccess: z.boolean(),
  data: z.unknown().optional(),
  errors: z.record(z.unknown()).nullable().optional(),
  timestamp: z.string().optional(),
});

export type ApiEnvelope = z.infer<typeof apiEnvelopeSchema>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** ASP.NET Core ProblemDetails, returned by endpoints on failure. */
const problemDetailsSchema = z.object({
  type: z.string().nullish(),
  title: z.string().nullish(),
  status: z.number().nullish(),
  detail: z.string().nullish(),
  instance: z.string().nullish(),
  errors: z.record(z.unknown()).nullish(),
});

export interface ApiFailure {
  message: string;
  errors: Record<string, unknown> | null;
}

/** Reads the message and field errors out of a failed response body. */
export function describeApiFailure(json: unknown): ApiFailure | null {
  const problem = problemDetailsSchema.safeParse(json);
  if (problem.success) {
    const message = problem.data.detail?.trim() || problem.data.title?.trim();
    if (message) return { message, errors: problem.data.errors ?? null };
  }
  const envelope = apiEnvelopeSchema.safeParse(json);
  if (envelope.success && !envelope.data.isSuccess) {
    const message = describeApiErrors(envelope.data.errors);
    if (message) return { message, errors: envelope.data.errors ?? null };
  }
  return null;
}

export function describeApiErrors(
  errors: Record<string, unknown> | null | undefined,
): string | null {
  if (!errors) return null;
  const messages: string[] = [];
  for (const value of Object.values(errors)) {
    if (typeof value === 'string') messages.push(value);
    else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') messages.push(item);
      }
    }
  }
  return messages.length > 0 ? messages.join(' ') : null;
}

/**
 * Returns `data` from an `ApiResponse` body, throws `ApiError` when `isSuccess` is
 * false, and passes a body that is not wrapped through unchanged.
 */
export function unwrapApiResponse(json: unknown, httpStatus = 0): unknown {
  const parsed = apiEnvelopeSchema.safeParse(json);
  if (!parsed.success) return json;
  if (!parsed.data.isSuccess) {
    throw new ApiError(
      parsed.data.statusCode || httpStatus,
      describeApiErrors(parsed.data.errors) ?? 'The request was not successful.',
      parsed.data.errors ?? null,
    );
  }
  return parsed.data.data;
}
