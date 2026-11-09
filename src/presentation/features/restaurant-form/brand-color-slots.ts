import { tokens } from '@/presentation/theme/tokens';

/**
 * Editable brand color slots (owner decision, permanent):
 * primary → primaryColorHex, background → secondaryColorHex, text → accentColorHex.
 */
export const BRAND_COLOR_SLOTS = [
  { key: 'primaryColor', label: 'primary', fallback: tokens.colors.primary.DEFAULT },
  { key: 'backgroundColor', label: 'background', fallback: tokens.colors.bg[2] },
  { key: 'textColor', label: 'text', fallback: tokens.colors.text.DEFAULT },
] as const;

export type BrandColorSlot = (typeof BRAND_COLOR_SLOTS)[number];

export const BRAND_COLOR_FIELD_KEYS = BRAND_COLOR_SLOTS.map((slot) => slot.key);
