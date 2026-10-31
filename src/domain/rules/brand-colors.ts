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

/** The request value when it is a valid hex color, otherwise the caller's token. */
export function brandColorOr(value: string | null | undefined, fallback: string): string {
  return isHexColor(value) ? value.trim() : fallback;
}
