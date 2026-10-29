import { AlertTriangle, Trash2 } from 'lucide-react';
import type { MenuExtractedItem } from '@/domain/entities';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { en } from '@/presentation/i18n/en';

export interface MenuEditableItem extends MenuExtractedItem {
  id: string;
}

export type MenuEditableField = 'nameAr' | 'nameEn' | 'price';

export const MAX_VISIBLE_MENU_ITEMS = 5;

export interface MenuResultDialogProps {
  open: boolean;
  rows: MenuEditableItem[];
  onClose: () => void;
  onEdit: (id: string, field: MenuEditableField, value: string) => void;
  onRemove: (id: string) => void;
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
  const visible = rows.slice(0, MAX_VISIBLE_MENU_ITEMS);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={en.menu.title}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {en.common.close}
        </Button>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">{en.menu.empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-2xs text-text-muted">
            {en.menu.count(visible.length, rows.length)}
          </p>

          <ul className="flex flex-col gap-3">
            {visible.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-panel border border-border bg-bg-2/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex flex-wrap items-baseline gap-1.5 text-2xs font-semibold text-text-muted">
                    {row.categoryEn ? <span dir="ltr">{row.categoryEn}</span> : null}
                    {row.categoryAr ? <span dir="rtl">{row.categoryAr}</span> : null}
                    {!row.categoryEn && !row.categoryAr ? (
                      <span>{en.common.notAvailable}</span>
                    ) : null}
                  </span>

                  <div className="flex items-center gap-2">
                    {row.needsReview ? (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-warning-bg px-2 py-0.5 text-2xs font-medium text-warning-fg">
                        <AlertTriangle aria-hidden="true" className="size-3" />
                        {en.menu.needsReview}
                      </span>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger-fg"
                      onClick={() => onRemove(row.id)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      {en.menu.removeItem}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    id={`menu-${row.id}-name-ar`}
                    label={en.menu.nameAr}
                    value={row.nameAr}
                    dir="rtl"
                    onChange={(event) => onEdit(row.id, 'nameAr', event.target.value)}
                  />
                  <Input
                    id={`menu-${row.id}-name-en`}
                    label={en.menu.nameEn}
                    value={row.nameEn}
                    dir="ltr"
                    onChange={(event) => onEdit(row.id, 'nameEn', event.target.value)}
                  />
                  <Input
                    id={`menu-${row.id}-price`}
                    label={en.menu.price}
                    value={row.price}
                    dir="ltr"
                    inputMode="decimal"
                    onChange={(event) => onEdit(row.id, 'price', event.target.value)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Dialog>
  );
}
