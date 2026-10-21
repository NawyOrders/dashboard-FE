/**
 * City options for the registration form (NW-246).
 *
 * The registration-fields JSON declares `city` with `options: "backend list (ASSUMPTION)"`
 * and no values, so this static list is used until the backend provides one.
 */
export const CITY_OPTIONS: string[] = [
  'القاهرة',
  'الاسكندرية',
  'الجيزة',
  'المنصورة',
  'طنطا',
  'أسيوط',
  'بورسعيد',
  'السويس',
  'شرم الشيخ',
  'الغردقة',
  'الفيوم',
  'بني سويف',
];

/**
 * Options of every `select` field of the registration form, keyed by the JSON field key.
 * The JSON declares `options: "backend list (ASSUMPTION)"`, so the list is filled from
 * the static city list until the backend provides one.
 */
export const SELECT_OPTIONS: Record<string, string[]> = {
  city: CITY_OPTIONS,
};
