import type { TenantMenuCategory } from '@/domain/entities';
import { en } from '@/presentation/i18n/en';
import { formatEgp } from '@/presentation/lib/format';

export interface MenuDetailsSectionProps {
  categories: TenantMenuCategory[];
}

function priceLabel(price: number | null): string {
  return price === null ? en.common.notAvailable : formatEgp(price);
}

/**
 * Menu returned by the onboarding details endpoint. It is read-only: the OCR result in
 * the Menu section stays local and nothing here is sent back with the request.
 */
export function MenuDetailsSection({ categories }: MenuDetailsSectionProps) {
  return (
    <section className="flex flex-col gap-3" aria-label={en.applications.menuTitle}>
      <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-muted">
        {en.applications.menuTitle}
      </h4>

      {categories.length === 0 ? (
        <p className="text-sm text-text-muted">{en.applications.menuEmpty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((category, categoryIndex) => (
            <article
              key={`${category.nameEn ?? category.nameAr ?? 'category'}-${categoryIndex}`}
              className="flex flex-col gap-2 rounded-panel border border-border bg-bg-2/40 p-4"
            >
              <header className="flex flex-wrap items-baseline gap-2">
                <span dir="ltr" className="text-sm font-semibold text-text">
                  {category.nameEn || category.nameAr || en.common.notAvailable}
                </span>
                {category.nameAr ? (
                  <span dir="rtl" className="text-2xs text-text-muted">
                    {category.nameAr}
                  </span>
                ) : null}
              </header>

              {category.items.length === 0 ? (
                <p className="text-2xs text-text-muted">{en.applications.menuCategoryEmpty}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={`${item.nameEn ?? item.nameAr ?? 'item'}-${itemIndex}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="flex flex-wrap items-baseline gap-2">
                          <span dir="ltr" className="text-sm text-text">
                            {item.nameEn || item.nameAr || en.common.notAvailable}
                          </span>
                          {item.nameAr ? (
                            <span dir="rtl" className="text-2xs text-text-muted">
                              {item.nameAr}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-2xs text-text-muted">{priceLabel(item.price)}</span>
                      </div>

                      {item.variants.length > 0 ? (
                        <ul className="mt-1 flex flex-wrap gap-2">
                          {item.variants.map((variant, variantIndex) => (
                            <li
                              key={`${variant.nameEn ?? variant.nameAr ?? 'variant'}-${variantIndex}`}
                              className="rounded-pill bg-card px-2 py-0.5 text-2xs text-text-muted"
                            >
                              {variant.nameEn || variant.nameAr || en.common.notAvailable}
                              {' · '}
                              {priceLabel(variant.price)}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
