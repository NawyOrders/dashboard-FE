import { z } from 'zod';
import type { LogoPaletteOutcome, SuggestLogoPaletteOptions } from '@/application/dto';
import type { LogoPalettePort } from '@/application/ports';
import { isTooLightOnWhite, normalizeHexColor } from '@/domain/rules/brand-colors';

const POLL_INTERVAL_MS = 5_000;
/** Same wait limit as the menu OCR (agent.md section 27): 5 minutes after submit. */
const TIMEOUT_MS = 5 * 60 * 1000;

const TERMINAL_FAILURES = new Set(['failed', 'cancelled', 'expired']);

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * `data.data` of the job result. Only `palette` is required; `tokens` and `meta` carry
 * the contrast hint and the warnings the popup shows.
 *
 * OPEN: the "too light for white" signal inside `meta`/`tokens` is not documented, so the
 * WCAG 4.5:1 ratio against white decides, and `tokens.accent.textOnWhite` is the color
 * suggested in that case. Backend to confirm the contrast fields.
 */
const paletteSchema = z.object({
  primary: z.string().regex(HEX_COLOR),
  secondary: z.string().regex(HEX_COLOR),
  accent: z.string().regex(HEX_COLOR),
  neutrals: z.array(z.string().regex(HEX_COLOR)).optional(),
});

const analysisSchema = z.object({
  palette: paletteSchema,
  tokens: z.unknown().optional(),
  meta: z.unknown().optional(),
});

/** Best-effort reads of the contrast hint and the warnings; a bad shape never hides the palette. */
const tokensSchema = z.object({
  accent: z.object({ textOnWhite: z.string() }).partial().optional(),
});

const metaSchema = z.object({
  warnings: z.array(z.string()).optional(),
});

interface ParsedPalette {
  /** Swatch order: primary, secondary, text suggestion, then the neutrals. */
  colors: string[];
  warnings: string[];
}

/** Reads the palette from the job data; `null` means the result is missing or invalid. */
function parsePalette(data: unknown): ParsedPalette | null {
  const parsed = analysisSchema.safeParse(data);
  if (!parsed.success) return null;

  const { palette, tokens, meta } = parsed.data;
  const primary = normalizeHexColor(palette.primary);
  const secondary = normalizeHexColor(palette.secondary);
  const accent = normalizeHexColor(palette.accent);
  if (!primary || !secondary || !accent) return null;

  // Accent doubles as the text color, so a too-light accent gets the token's text color.
  const tokensResult = tokensSchema.safeParse(tokens);
  const accentToken = tokensResult.success ? tokensResult.data.accent : undefined;
  const textOnWhite = accentToken?.textOnWhite
    ? normalizeHexColor(accentToken.textOnWhite)
    : null;
  const text = textOnWhite && isTooLightOnWhite(accent) ? textOnWhite : accent;

  const neutrals: string[] = [];
  for (const neutral of palette.neutrals ?? []) {
    const color = normalizeHexColor(neutral);
    if (color && ![primary, secondary, text, ...neutrals].includes(color)) {
      neutrals.push(color);
    }
  }

  const parsedMeta = metaSchema.safeParse(meta);
  const warnings = (parsedMeta.success ? (parsedMeta.data.warnings ?? []) : [])
    .map((warning) => warning.trim())
    .filter((warning) => warning.length > 0);

  return { colors: [primary, secondary, text, ...neutrals], warnings };
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
 * a timeout outcome. A finished job whose result has no readable `palette` is
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
        const parsed = parsePalette(result.data);
        return parsed
          ? { status: 'completed', colors: parsed.colors, warnings: parsed.warnings }
          : { status: 'unreadable' };
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
