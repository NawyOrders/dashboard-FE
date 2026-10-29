import type { MenuExtractedItem } from '@/domain/entities';

/**
 * Flattens the OCR result into editable rows, in the order the categories and their
 * items were returned.
 *
 * OPEN: the extraction payload shape is not confirmed yet, so the value is read
 * defensively instead of being cast to a strict type.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

export function flattenMenuItems(result: unknown): MenuExtractedItem[] {
  if (!isRecord(result)) return [];

  const rows: MenuExtractedItem[] = [];
  for (const category of records(result.categories)) {
    const categoryAr = text(category.nameAr);
    const categoryEn = text(category.nameEn);
    for (const item of records(category.items)) {
      rows.push({
        categoryAr,
        categoryEn,
        nameAr: text(item.nameAr),
        nameEn: text(item.nameEn),
        price: text(item.price),
        needsReview: item.needsReview === true,
      });
    }
  }
  return rows;
}
