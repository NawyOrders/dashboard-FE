import { useEffect, useState } from 'react';
import { BookOpen, RotateCcw } from 'lucide-react';
import { api } from '@/app/composition';
import type { TenantMenuCategory } from '@/domain/entities';
import { useLocale } from '@/i18n';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { en } from '@/presentation/i18n/en';
import { formatMenuPrice } from './menu-price';

export interface MenuViewDialogProps {
  open: boolean;
  requestId: string;
  onClose: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

/**
 * Read-only menu of the request. Every open refetches the request details, so the catalog
 * is never kept in component state or browser storage between openings.
 */
export function MenuViewDialog({ open, requestId, onClose }: MenuViewDialogProps) {
  const locale = useLocale();
  const [state, setState] = useState<LoadState>('loading');
  const [categories, setCategories] = useState<TenantMenuCategory[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState('loading');

    // OPEN: confirm the backend stores OCR catalog on the request when referenceId is sent
    api
      .getApplication(requestId)
      .then((tenant) => {
        if (cancelled) return;
        setCategories(tenant.menuCategories ?? []);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [open, requestId, attempt]);

  const withItems = categories.filter((category) => category.items.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      mobileFull
      title={
        <span className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
            <BookOpen aria-hidden="true" className="size-5" />
          </span>
          <span>{en.applications.menuViewTitle}</span>
        </span>
      }
      footer={
        <Button onClick={onClose}>{en.common.close}</Button>
      }
    >
      {state === 'loading' ? (
        <p role="status" className="px-6 py-10 text-center text-sm text-text-muted">
          {en.common.loading}
        </p>
      ) : state === 'error' ? (
        <div role="alert" className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <p className="text-sm font-medium text-text">{en.applications.menuViewError}</p>
          <Button
            variant="secondary"
            onClick={() => setAttempt((current) => current + 1)}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {en.common.retry}
          </Button>
        </div>
      ) : withItems.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-text-muted">
          {en.applications.menuExtractedEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {withItems.map((category, categoryIndex) => {
            const label =
              (locale === 'ar' ? category.nameAr : category.nameEn) ||
              category.nameAr ||
              category.nameEn ||
              en.common.notAvailable;

            return (
              <section
                key={`${label}-${categoryIndex}`}
                aria-label={label}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3
                    dir="auto"
                    className="truncate text-2xs font-semibold text-text-muted"
                  >
                    {label}
                  </h3>
                  <span className="shrink-0 rounded-pill bg-bg-2 px-2 py-0.5 text-micro font-medium text-text-muted">
                    {en.applications.menuItemCount(category.items.length)}
                  </span>
                </div>

                <ul className="flex flex-col divide-y divide-border rounded-panel border border-border bg-bg-2/40">
                  {category.items.map((item, itemIndex) => {
                    const name =
                      (locale === 'ar' ? item.nameAr : item.nameEn) ||
                      item.nameAr ||
                      item.nameEn ||
                      en.common.notAvailable;
                    const price = item.price === null ? null : formatMenuPrice(item.price, locale);

                    return (
                      <li
                        key={`${name}-${itemIndex}`}
                        className="flex flex-col gap-1.5 px-4 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span dir="auto" className="min-w-0 text-sm font-medium text-text">
                            {name}
                          </span>
                          <span
                            dir="ltr"
                            className={
                              price
                                ? 'whitespace-nowrap rounded-pill bg-primary/10 px-2 py-0.5 text-2xs font-semibold text-primary'
                                : 'text-2xs text-text-muted'
                            }
                          >
                            {price ?? en.common.notAvailable}
                          </span>
                        </div>

                        {item.variants.length > 0 ? (
                          <span className="flex flex-wrap items-center gap-1.5">
                            {item.variants.map((variant, variantIndex) => {
                              const variantName =
                                (locale === 'ar' ? variant.nameAr : variant.nameEn) ||
                                variant.nameAr ||
                                variant.nameEn ||
                                en.common.notAvailable;
                              const variantPrice =
                                variant.price === null
                                  ? null
                                  : formatMenuPrice(variant.price, locale);

                              return (
                                <span
                                  key={`${variantName}-${variantIndex}`}
                                  className="rounded-pill bg-bg-2 px-2 py-0.5 text-micro font-medium text-text-muted"
                                >
                                  {variantName}
                                  {variantPrice && (
                                    <span className="ms-1">{variantPrice}</span>
                                  )}
                                </span>
                              );
                            })}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
