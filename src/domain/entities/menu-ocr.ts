/**
 * Menu OCR contract (swagger). `POST /api/v1/onboarding/menu-ocr` answers 202 with a
 * job; the extraction is read from `GET /api/v1/ai/jobs/{jobId}/result`.
 */

export interface MenuOcrSubmission {
  jobId: string;
  jobType: string;
  status: string;
  estimatedSeconds: number | null;
  statusUrl: string | null;
  resultUrl: string | null;
  submittedAtUtc: string | null;
}

export interface MenuOcrStatus {
  jobId: string;
  jobType: string;
  status: string;
  progressPercentage: number | null;
  stage: string | null;
  elapsedSeconds: number | null;
  estimatedRemainingSeconds: number | null;
  hasResult: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  createdAtUtc: string | null;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
}

export interface MenuOcrResultPayload {
  jobId: string;
  jobType: string;
  completedAtUtc: string | null;
  durationSeconds: number | null;
  /**
   * OPEN: the extraction shape is not confirmed yet; it is read defensively in
   * `domain/rules/menu-extraction.ts`.
   */
  data?: unknown;
}

/** One editable row of the extracted menu. */
export interface MenuExtractedItem {
  categoryAr: string;
  categoryEn: string;
  nameAr: string;
  nameEn: string;
  /** Kept as text so the editable input preserves whatever the OCR returned. */
  price: string;
  needsReview: boolean;
}
