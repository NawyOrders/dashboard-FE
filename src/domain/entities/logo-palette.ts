/**
 * Logo palette contract (swagger). `POST /api/v1/onboarding/logo-palette` answers 202
 * with an AI job; the suggested colors are read from `GET /api/v1/ai/jobs/{jobId}/result`.
 *
 * OPEN: logo palette result shape, backend to confirm.
 */

export interface LogoPaletteSubmission {
  jobId: string;
  jobType: string;
  status: string;
  estimatedSeconds: number | null;
  statusUrl: string | null;
  resultUrl: string | null;
  submittedAtUtc: string | null;
}

export interface LogoPaletteResultPayload {
  jobId: string;
  jobType: string;
  completedAtUtc: string | null;
  /** OPEN: the palette shape is not confirmed; it is parsed in the use case. */
  data?: unknown;
}
