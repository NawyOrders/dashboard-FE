import { z } from 'zod';
import type { LogoPaletteOutcome, SuggestLogoPaletteOptions } from '@/application/dto';
import type { LogoPalettePort } from '@/application/ports';
import { normalizeHexColor } from '@/domain/rules/brand-colors';

const POLL_INTERVAL_MS = 5_000;
/** Same wait limit as the menu OCR (agent.md section 27): 5 minutes after submit. */
const TIMEOUT_MS = 5 * 60 * 1000;

const TERMINAL_FAILURES = new Set(['failed', 'cancelled', 'expired']);

// OPEN: logo palette result shape, backend to confirm.
const paletteSchema = z.union([
  z.object({ colors: z.array(z.string()) }),
  z.array(z.string()),
]);

/** Reads a list of hex colors from the job data; `null` means the shape is unknown. */
function parsePalette(data: unknown): string[] | null {
  const parsed = paletteSchema.safeParse(data);
  if (!parsed.success) return null;
  const raw = Array.isArray(parsed.data) ? parsed.data : parsed.data.colors;
  const colors = raw
    .map((color) => normalizeHexColor(color))
    .filter((color): color is string => color !== null);
  return colors.length > 0 ? [...new Set(colors)] : null;
}

function abortError(): Error {
  return new DOMException('The logo palette request was cancelled.', 'AbortError');
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

/**
 * Logo palette flow: submit the logo, read the job status every 5 seconds and return the
 * suggested hex colors. The job is read for at most 5 minutes; after that the caller gets
 * a timeout outcome. A finished job whose result is not a list of hex colors is
 * `unreadable`, so the form keeps the manual color inputs.
 */
export function makeSuggestLogoPalette(palette: LogoPalettePort) {
  return async function suggestLogoPalette(
    file: File,
    options: SuggestLogoPaletteOptions = {},
  ): Promise<LogoPaletteOutcome> {
    const { signal, onProgress, referenceId } = options;

    const submission = await palette.submit(file, { referenceId, signal });
    onProgress?.({ status: submission.status, progressPercentage: 0 });

    const deadline = Date.now() + TIMEOUT_MS;

    for (;;) {
      const snapshot = await palette.getStatus(submission.jobId, signal);
      onProgress?.({
        status: snapshot.status,
        progressPercentage: snapshot.progressPercentage,
      });

      const status = snapshot.status.trim().toLowerCase();
      if (status === 'completed') {
        const result = await palette.getResult(submission.jobId, signal);
        const colors = parsePalette(result.data);
        return colors ? { status: 'completed', colors } : { status: 'unreadable' };
      }
      if (TERMINAL_FAILURES.has(status)) {
        return {
          status: 'failed',
          errorCode: snapshot.errorCode,
          errorMessage: snapshot.errorMessage,
        };
      }

      if (Date.now() >= deadline) {
        return { status: 'timeout' };
      }
      await wait(POLL_INTERVAL_MS, signal);
    }
  };
}
