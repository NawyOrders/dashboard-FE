import type { ExtractMenuOptions, MenuExtractionOutcome } from '@/application/dto';
import type { MenuOcrPort } from '@/application/ports';
import { checkMenuFile } from '@/domain/rules/menu-file';
import { flattenMenuItems } from '@/domain/rules/menu-extraction';

const POLL_INTERVAL_MS = 5_000;
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
 * Menu OCR flow: validate the photo, submit the job, then read the job status every
 * 5 seconds until a final state. The job is read for at most 120 seconds; after that the
 * caller gets the last status and the job id so it can check again without re-uploading.
 *
 * The result stays in memory with the caller; nothing is saved or sent with the
 * application submit.
 */
export function makeExtractMenu(ocr: MenuOcrPort) {
  return async function extractMenu(
    file: File | null,
    options: ExtractMenuOptions = {},
  ): Promise<MenuExtractionOutcome> {
    const { signal, onProgress, referenceId, jobId: resumeJobId } = options;

    let jobId = resumeJobId ?? null;
    if (!jobId) {
      const problem = checkMenuFile(file);
      if (problem || !file) return { status: 'invalid-file', problem: problem ?? 'required' };

      const submission = await ocr.submit(file, { referenceId, signal });
      jobId = submission.jobId;
      onProgress?.({ status: submission.status, progressPercentage: 0, stage: null });
    }

    const deadline = Date.now() + TIMEOUT_MS;

    for (;;) {
      const snapshot = await ocr.getStatus(jobId, signal);
      const progress = {
        status: snapshot.status,
        progressPercentage: snapshot.progressPercentage,
        stage: snapshot.stage,
      };
      onProgress?.(progress);

      const status = normalizeStatus(snapshot.status);
      if (status === 'completed') {
        const result = await ocr.getResult(jobId, signal);
        return {
          status: 'completed',
          jobId,
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

      if (Date.now() >= deadline) {
        return { status: 'timeout', jobId };
      }
      await wait(Math.min(POLL_INTERVAL_MS, deadline - Date.now()), signal);
    }
  };
}
