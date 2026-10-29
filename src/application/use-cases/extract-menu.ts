import type { ExtractMenuOptions, MenuExtractionOutcome } from '@/application/dto';
import type { MenuOcrPort } from '@/application/ports';
import { checkMenuFile } from '@/domain/rules/menu-file';
import { flattenMenuItems } from '@/domain/rules/menu-extraction';

const DEFAULT_POLL_MS = 3_000;
const MAX_POLL_MS = 6_000;
const POLL_STEP_MS = 1_000;
const JITTER_MS = 250;
const TIMEOUT_MS = 120_000;

const TERMINAL_FAILURES = new Set(['failed', 'cancelled', 'expired']);

function abortError(): Error {
  return new DOMException('The menu extraction was cancelled.', 'AbortError');
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(abortError());
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

/**
 * Menu OCR flow: validate the photo, submit the job, poll it and return the extracted
 * rows or a failure. Polling waits Retry-After (3 s by default), backs off towards 6 s
 * with a small jitter and gives up after 120 s.
 *
 * The result stays in memory with the caller; nothing is saved or sent with the
 * application submit.
 */
export function makeExtractMenu(ocr: MenuOcrPort) {
  return async function extractMenu(
    file: File | null,
    options: ExtractMenuOptions = {},
  ): Promise<MenuExtractionOutcome> {
    const problem = checkMenuFile(file);
    if (problem || !file) return { status: 'invalid-file', problem: problem ?? 'required' };

    const { signal, onProgress } = options;
    const submission = await ocr.submit(file, signal);
    onProgress?.({
      status: submission.status,
      progressPercentage: 0,
      stage: null,
    });

    const deadline = Date.now() + TIMEOUT_MS;
    let delayMs = (submission.retryAfterSeconds ?? DEFAULT_POLL_MS / 1000) * 1_000;

    for (;;) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) return { status: 'timeout', jobId: submission.jobId };
      await wait(Math.min(delayMs, remaining), signal);

      const snapshot = await ocr.getStatus(submission.jobId, signal);
      onProgress?.({
        status: snapshot.status,
        progressPercentage: snapshot.progressPercentage,
        stage: snapshot.stage,
      });

      const status = normalizeStatus(snapshot.status);
      if (status === 'completed') {
        const result = await ocr.getResult(submission.jobId, signal);
        return {
          status: 'completed',
          jobId: submission.jobId,
          items: flattenMenuItems(result.data),
          completedAtUtc: result.completedAtUtc,
        };
      }
      if (TERMINAL_FAILURES.has(status)) {
        return {
          status: 'failed',
          errorCode: snapshot.errorCode,
          errorMessage: snapshot.errorMessage,
        };
      }

      delayMs = Math.min(MAX_POLL_MS, delayMs + POLL_STEP_MS) + Math.floor(Math.random() * JITTER_MS);
    }
  };
}
