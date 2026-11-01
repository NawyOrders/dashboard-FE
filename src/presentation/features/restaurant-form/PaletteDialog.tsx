import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { isRgbHexColor, normalizeHexColor } from '@/domain/rules/brand-colors';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { en } from '@/presentation/i18n/en';
import { BRAND_COLOR_SLOTS } from './brand-color-slots';
import type { BrandColorSlot } from './brand-color-slots';

type SlotKey = BrandColorSlot['key'];

interface PaletteEntry {
  id: string;
  color: string;
  slot: SlotKey | '';
}

/** Slots the admin assigned; an unassigned slot keeps its current form value. */
export type PaletteSelection = Partial<Record<SlotKey, string>>;

export interface PaletteDialogProps {
  colors: string[];
  /** `meta.warnings` from the job; rendered only when not empty. */
  warnings?: string[];
  onCancel: () => void;
  onApply: (selection: PaletteSelection) => void;
}

/**
 * Logo palette popup: each suggested swatch is assigned to a slot (or ignored) and its
 * hex can be edited. Default assignment follows the returned order: primary, background,
 * text. Nothing reaches the form until the admin confirms.
 */
export function PaletteDialog({ colors, warnings = [], onCancel, onApply }: PaletteDialogProps) {
  const [entries, setEntries] = useState<PaletteEntry[]>(() =>
    colors.map((color, index) => ({
      id: `palette-${index}`,
      color: normalizeHexColor(color) ?? color,
      slot: BRAND_COLOR_SLOTS[index]?.key ?? '',
    })),
  );

  const slotOptions = [
    { value: '', label: en.registration.brandColors.notUsed },
    ...BRAND_COLOR_SLOTS.map((slot) => ({
      value: slot.key,
      label: en.registration.brandColors[slot.label],
    })),
  ];

  const invalidIds = useMemo(
    () => new Set(entries.filter((entry) => !isRgbHexColor(entry.color)).map((entry) => entry.id)),
    [entries],
  );
  const hasInvalid = invalidIds.size > 0;

  function updateEntry(id: string, patch: Partial<PaletteEntry>) {
    setEntries((current) => {
      const next = current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
      if (!patch.slot) return next;
      // One color per slot: assigning a slot releases it from the other rows.
      return next.map((entry) =>
        entry.id !== id && entry.slot === patch.slot ? { ...entry, slot: '' } : entry,
      );
    });
  }

  function handleApply() {
    if (hasInvalid) return;
    const selection: PaletteSelection = {};
    for (const entry of entries) {
      if (!entry.slot) continue;
      selection[entry.slot] = entry.color.trim().toUpperCase();
    }
    onApply(selection);
  }

  return (
    <Dialog
      open
      onClose={onCancel}
      title={en.registration.brandColors.paletteTitle}
      description={en.registration.brandColors.paletteDescription}
      size="lg"
      mobileFull
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {en.common.cancel}
          </Button>
          <Button onClick={handleApply} disabled={hasInvalid || entries.length === 0}>
            {en.registration.brandColors.applyPalette}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {warnings.length > 0 ? (
          <div className="flex gap-2 rounded-panel bg-warning-bg px-3 py-2 text-2xs text-warning-fg">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {en.registration.brandColors.paletteWarnings}
              </span>
              <ul className="flex list-disc flex-col gap-0.5 ps-4">
                {warnings.map((warning, index) => (
                  <li key={`${index}-${warning}`}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {entries.map((entry, index) => {
          const valid = isRgbHexColor(entry.color);
          return (
            <div
              key={entry.id}
              className="flex flex-col gap-2 rounded-panel border border-border bg-card p-3 sm:flex-row sm:items-start"
            >
              <span
                aria-hidden="true"
                className="size-11 shrink-0 rounded-panel border border-border"
                style={{ backgroundColor: valid ? entry.color : 'transparent' }}
              />
              <div className="min-w-0 flex-1">
                <Input
                  aria-label={en.registration.brandColors.suggestedColor(index + 1)}
                  dir="ltr"
                  spellCheck={false}
                  autoComplete="off"
                  value={entry.color}
                  error={valid ? undefined : en.registration.brandColors.invalidHex}
                  onChange={(event) => updateEntry(entry.id, { color: event.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  aria-label={en.registration.brandColors.assignSlot}
                  value={entry.slot}
                  options={slotOptions}
                  onChange={(event) =>
                    updateEntry(entry.id, { slot: event.target.value as SlotKey | '' })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}
