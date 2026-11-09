/**
 * AI job timing (agent.md section 27).
 *
 * The wait limits are dashboard rules: the job loop stops at the limit and shows the
 * timeout message. The per-request limit only bounds one HTTP call; a request that times
 * out is retried and never ends the job.
 */

/** Owner decision (agent.md section 27): the menu OCR job is waited for 5 minutes. */
export const MENU_OCR_WAIT_MS = 5 * 60 * 1000;

/** Same rule as the menu OCR, with its own constant for the logo palette job. */
export const LOGO_PALETTE_WAIT_MS = 5 * 60 * 1000;

/** Submit, status poll and result read each get a short timeout of their own. */
export const AI_JOB_REQUEST_TIMEOUT_MS = 30_000;
