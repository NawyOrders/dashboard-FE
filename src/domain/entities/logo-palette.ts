/**
 * Logo palette contract (swagger). `POST /api/v1/onboarding/logo-palette` answers 202
 * with an AI job; the analysis is read from `GET /api/v1/ai/jobs/{jobId}/result`.
 *
 * Result envelope: `ApiResponse.data = { jobId, jobType, completedAtUtc, durationSeconds, data }`.
 * The palette lives in `data.palette` and the contrast hints in `data.tokens`/`data.meta`;
 * the use case validates `data.palette` before using it.
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
  durationSeconds: number | null;
  /** The AI analysis object; validated in the use case (`data.palette`). */
  data?: unknown;
}
