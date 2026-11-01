const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** A CSS hex color (`#rgb` or `#rrggbb`); the onboarding request may send anything. */
export function isHexColor(value: string | null | undefined): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value.trim());
}

/** Strict `#RRGGBB` color accepted by the editable brand color fields. */
export function isRgbHexColor(value: string | null | undefined): value is string {
  return typeof value === 'string' && RGB_HEX_COLOR.test(value.trim());
}

/** `#RGB`/`#RRGGBB` → uppercase `#RRGGBB`; `null` when the value is not a hex color. */
export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!isHexColor(trimmed)) return null;
  const hex = trimmed.slice(1);
  const full = hex.length === 3 ? [...hex].map((char) => char + char).join('') : hex;
  return `#${full.toUpperCase()}`;
}

/** The request value when it is a valid hex color, otherwise the caller's token. */
export function brandColorOr(value: string | null | undefined, fallback: string): string {
  return isHexColor(value) ? value.trim() : fallback;
}

/** WCAG 2.1 minimum contrast for normal text (4.5:1). */
export const MIN_TEXT_CONTRAST_ON_WHITE = 4.5;

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const red = channelToLinear(parseInt(normalized.slice(1, 3), 16));
  const green = channelToLinear(parseInt(normalized.slice(3, 5), 16));
  const blue = channelToLinear(parseInt(normalized.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Contrast ratio of a hex color against a white background; `null` for a non-hex value. */
export function contrastRatioOnWhite(hex: string): number | null {
  const luminance = relativeLuminance(hex);
  if (luminance === null) return null;
  return 1.05 / (luminance + 0.05);
}

/** True when a color is too light to be read as text on a white background. */
export function isTooLightOnWhite(hex: string): boolean {
  const ratio = contrastRatioOnWhite(hex);
  return ratio !== null && ratio < MIN_TEXT_CONTRAST_ON_WHITE;
}
