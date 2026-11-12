import type { TenantMenuCategory } from '@/domain/entities';
import { en } from '@/presentation/i18n/en';

export interface MenuDetailsSectionProps {
  categories: TenantMenuCategory[];
  /** Shown instead of the default "no menu" text when the catalog is known to be empty. */
  emptyMessage?: string;
}

function categoryName(category: TenantMenuCategory): string {
  return category.nameEn || category.nameAr || en.common.notAvailable;
}

/**
 * Compact menu preview for the application dialog: category names and item counts from
 * the onboarding details endpoint. It is read-only; the OCR result in the Menu section
 * stays local and nothing here is sent back with the request.
 */
// OPEN: menu preview content, owner to confirm
export function MenuDetailsSection({ categories, emptyMessage }: MenuDetailsSectionProps) {
  return (
    <section className="flex flex-col gap-3" aria-label={en.applications.menuTitle}>
      <h4 className="text-2xs font-semibold text-text-muted">
        {en.applications.menuTitle}
      </h4>

      {categories.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyMessage ?? en.applications.menuNotUploaded}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-panel border border-border bg-bg-2/40">
          {categories.map((category, index) => (
            <li
              key={`${category.nameEn ?? category.nameAr ?? 'category'}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"
            >
              <span className="flex flex-wrap items-baseline gap-2">
                <span dir="ltr" className="text-sm text-text">
                  {categoryName(category)}
                </span>
                {category.nameEn && category.nameAr ? (
                  <span dir="rtl" className="text-2xs text-text-muted">
                    {category.nameAr}
                  </span>
                ) : null}
              </span>
              <span className="text-2xs text-text-muted">
                {en.applications.menuItemCount(category.items.length)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
