import { AlertTriangle, ImageOff, ListChecks, ScanText, Trash2 } from 'lucide-react';
import { useLocale } from '@/i18n';
import type { Locale } from '@/i18n';
import type { MenuExtractedItem } from '@/domain/entities';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Tooltip } from '@/presentation/components/ui/Tooltip';
import { cn } from '@/presentation/lib/cn';
import { en } from '@/presentation/i18n/en';

export interface MenuEditableItem extends MenuExtractedItem {
  id: string;
  /** Presentation-only: OCR payloads do not carry variants yet, chips render when present. */
  variants?: string[];
}

export type MenuEditableField = 'nameAr' | 'nameEn' | 'price';

export interface MenuResultDialogProps {
  open: boolean;
  rows: MenuEditableItem[];
  onClose: () => void;
  onEdit: (id: string, field: MenuEditableField, value: string) => void;
  onRemove: (id: string) => void;
}

interface MenuGroup {
  key: string;
  labelAr: string;
  labelEn: string;
  rows: MenuEditableItem[];
}

const PRICE_FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }),
  ar: new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }),
};

function formatPrice(value: string, locale: Locale): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const amount = Number(trimmed);
  return Number.isFinite(amount) ? PRICE_FORMATTERS[locale].format(amount) : trimmed;
}

function groupByCategory(rows: MenuEditableItem[]): MenuGroup[] {
  const groups = new Map<string, MenuGroup>();
  for (const row of rows) {
    const key = `${row.categoryAr}\u0000${row.categoryEn}`;
    const existing = groups.get(key);
    if (existing) {
      existing.rows.push(row);
      continue;
    }
    groups.set(key, {
      key,
      labelAr: row.categoryAr,
      labelEn: row.categoryEn,
      rows: [row],
    });
  }
  return [...groups.values()];
}

/**
 * Popup with the extracted menu. Every edit and removal stays in the component state of
 * the Menu section; nothing is saved and nothing is sent with the application.
 */
export function MenuResultDialog({
  open,
  rows,
  onClose,
  onEdit,
  onRemove,
}: MenuResultDialogProps) {
  const locale = useLocale();
  const groups = groupByCategory(rows);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      mobileFull
      title={
        <span className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
            <ScanText aria-hidden="true" className="size-5" />
          </span>
          <span>{en.menu.title}</span>
        </span>
      }
      description={en.menu.subtitle}
      footer={
        <Button onClick={onClose} className="w-full md:w-auto">
          {en.common.close}
        </Button>
      }
    >
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-avatar bg-bg-2 text-text-muted">
            <ImageOff aria-hidden="true" className="size-8" />
          </div>
          <p className="text-base font-semibold text-text">{en.menu.empty}</p>
          <p className="max-w-sm text-2xs text-text-muted">{en.menu.emptyHint}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-bg-2 px-2.5 py-1 text-2xs font-medium text-text-muted">
              <ListChecks aria-hidden="true" className="size-3.5" />
              {en.menu.count(rows.length, rows.length)}
            </span>
          </div>

          {groups.map((group) => {
            const label =
              locale === 'ar'
                ? group.labelAr || group.labelEn
                : group.labelEn || group.labelAr;
            const itemsCount = en.menu.itemsCount(group.rows.length);

            return (
              <section
                key={group.key}
                aria-label={label || en.common.notAvailable}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3
                    dir="auto"
                    className="truncate text-2xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {label || en.common.notAvailable}
                  </h3>
                  <span className="shrink-0 rounded-pill bg-bg-2 px-2 py-0.5 text-micro font-medium text-text-muted">
                    {itemsCount}
                  </span>
                </div>

                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {group.rows.map((row) => {
                    const displayName =
                      locale === 'ar'
                        ? row.nameAr || row.nameEn
                        : row.nameEn || row.nameAr;
                    const priceText = formatPrice(row.price, locale);
                    const variants = row.variants ?? [];

                    return (
                      <li
                        key={row.id}
                        className={cn(
                          'flex flex-col gap-3 rounded-panel border border-border bg-card p-3',
                          'transition-colors duration-150 hover:border-border-hover hover:bg-bg-2/40',
                          'focus-within:border-border-hover focus-within:bg-bg-2/40',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-col gap-1.5">
                            <Tooltip
                              label={displayName || en.common.notAvailable}
                              className="w-full"
                            >
                              <span
                                dir="auto"
                                className="min-w-0 truncate text-sm font-semibold text-text"
                              >
                                {displayName || en.common.notAvailable}
                              </span>
                            </Tooltip>

                            {(row.needsReview || variants.length > 0) && (
                              <span className="flex flex-wrap items-center gap-1.5">
                                {row.needsReview ? (
                                  <span className="inline-flex items-center gap-1 rounded-pill bg-warning-bg px-2 py-0.5 text-micro font-medium text-warning-fg">
                                    <AlertTriangle aria-hidden="true" className="size-3" />
                                    {en.menu.needsReview}
                                  </span>
                                ) : null}
                                {variants.map((variant) => (
                                  <span
                                    key={variant}
                                    className="rounded-pill bg-bg-2 px-2 py-0.5 text-micro font-medium text-text-muted"
                                  >
                                    {variant}
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <span
                              dir="ltr"
                              className={cn(
                                'whitespace-nowrap rounded-pill px-2 py-1 text-2xs font-semibold',
                                priceText
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-bg-2 text-text-muted',
                              )}
                            >
                              {priceText ?? en.common.notAvailable}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger-fg"
                              aria-label={en.menu.removeItem}
                              onClick={() => onRemove(row.id)}
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <Input
                            id={`menu-${row.id}-name-ar`}
                            label={en.menu.nameAr}
                            value={row.nameAr}
                            dir="rtl"
                            className="focus:ring-4 focus:ring-focus"
                            onChange={(event) => onEdit(row.id, 'nameAr', event.target.value)}
                          />
                          <Input
                            id={`menu-${row.id}-name-en`}
                            label={en.menu.nameEn}
                            value={row.nameEn}
                            dir="ltr"
                            className="focus:ring-4 focus:ring-focus"
                            onChange={(event) => onEdit(row.id, 'nameEn', event.target.value)}
                          />
                          <Input
                            id={`menu-${row.id}-price`}
                            label={en.menu.price}
                            value={row.price}
                            dir="ltr"
                            inputMode="decimal"
                            className="focus:ring-4 focus:ring-focus"
                            onChange={(event) => onEdit(row.id, 'price', event.target.value)}
                          />
                        </div>
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
