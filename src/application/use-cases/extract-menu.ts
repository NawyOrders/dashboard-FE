import type { ExtractMenuOptions, MenuExtractionOutcome } from '@/application/dto';
import type { MenuOcrPort } from '@/application/ports';
import { MENU_OCR_WAIT_MS } from '@/config/ai-jobs';
import { checkMenuFile } from '@/domain/rules/menu-file';
import { flattenMenuItems } from '@/domain/rules/menu-extraction';

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_INTERVAL_MS = 15_000;

const TERMINAL_FAILURES = new Set(['failed', 'cancelled', 'expired']);

// The backend estimate is only a hint for the poll interval; 5 s is the floor and 15 s the
// ceiling so a short remaining time still polls often enough.
function pollInterval(estimatedRemainingSeconds: number | null): number {
  if (estimatedRemainingSeconds === null) return POLL_INTERVAL_MS;
  const hint = (estimatedRemainingSeconds * 1000) / 4;
  return Math.min(MAX_POLL_INTERVAL_MS, Math.max(POLL_INTERVAL_MS, hint));
}

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

/** One HTTP call timed out (`AbortSignal.timeout`); the job itself keeps going. */
function isRequestTimeout(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'TimeoutError';
}

function isCancelled(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true;
}

function remainingMs(deadline: number): number {
  return Math.max(0, deadline - Date.now());
}

/**
 * Menu OCR flow: validate the photo, submit the job, then read the job status every
 * 5 to 15 seconds until a final state. The job is read for at most five minutes
 * (`MENU_OCR_WAIT_MS`) from submit; after that the caller gets a timeout outcome with the
 * job id and offers a fresh retry.
 *
 * Each HTTP call has its own short timeout. A submit, status poll or result read that
 * times out is retried until the wait limit, so an HTTP timeout never ends the job and
 * never shows the timeout message.
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
    const deadline = Date.now() + MENU_OCR_WAIT_MS;

    let jobId = resumeJobId ?? null;
    if (!jobId) {
      const problem = checkMenuFile(file);
      if (problem || !file) return { status: 'invalid-file', problem: problem ?? 'required' };

      for (;;) {
        try {
          const submission = await ocr.submit(file, { referenceId, signal });
          jobId = submission.jobId;
          onProgress?.({ status: submission.status, progressPercentage: 0, stage: null });
          break;
        } catch (error) {
          if (isCancelled(signal) || !isRequestTimeout(error)) throw error;
          if (Date.now() >= deadline) return { status: 'timeout', jobId: null };
          await wait(Math.min(POLL_INTERVAL_MS, remainingMs(deadline)), signal);
        }
      }
    }

    if (jobId === null) return { status: 'timeout', jobId: null };

    for (;;) {
      if (Date.now() >= deadline) return { status: 'timeout', jobId };

      let snapshot;
      try {
        snapshot = await ocr.getStatus(jobId, signal);
      } catch (error) {
        if (isCancelled(signal) || !isRequestTimeout(error)) throw error;
        if (Date.now() >= deadline) return { status: 'timeout', jobId };
        await wait(Math.min(POLL_INTERVAL_MS, remainingMs(deadline)), signal);
        continue;
      }

      const progress = {
        status: snapshot.status,
        progressPercentage: snapshot.progressPercentage,
        stage: snapshot.stage,
      };
      onProgress?.(progress);

      const status = normalizeStatus(snapshot.status);
      if (status === 'completed') {
        for (;;) {
          try {
            const result = await ocr.getResult(jobId, signal);
            return {
              status: 'completed',
              jobId,
              items: flattenMenuItems(result.data),
              completedAtUtc: result.completedAtUtc,
            };
          } catch (error) {
            if (isCancelled(signal) || !isRequestTimeout(error)) throw error;
            if (Date.now() >= deadline) return { status: 'timeout', jobId };
            await wait(Math.min(POLL_INTERVAL_MS, remainingMs(deadline)), signal);
          }
        }
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
      await wait(
        Math.min(pollInterval(snapshot.estimatedRemainingSeconds), remainingMs(deadline)),
        signal,
      );
    }
  };
}
