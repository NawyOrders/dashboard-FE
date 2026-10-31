import { X } from 'lucide-react';
import { isRgbHexColor } from '@/domain/rules/brand-colors';
import { Input } from '@/presentation/components/ui/Input';
import { en } from '@/presentation/i18n/en';
import { BRAND_COLOR_SLOTS } from './brand-color-slots';

export interface BrandColorsSectionProps {
  values: Record<string, string>;
  disabled?: boolean;
  /** Validation messages keyed by the JSON field key. */
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

/**
 * Editable brand colors block of the application form. An empty slot keeps the design
 * token as its swatch and clears the stored value (`null`) on save.
 */
export function BrandColorsSection({ values, disabled, errors, onChange }: BrandColorsSectionProps) {
  return (
    <section
      className="flex flex-col gap-3"
      aria-label={en.registration.sections.brand_colors}
    >
      <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-muted">
        {en.registration.sections.brand_colors}
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {BRAND_COLOR_SLOTS.map((slot) => {
          const value = (values[slot.key] ?? '').trim();
          const error = errors?.[slot.key];
          const swatch = isRgbHexColor(value) ? value : slot.fallback;
          const inputId = `rf-field-${slot.key}`;
          const label = en.registration.brandColors[slot.label];

          return (
            <div key={slot.key} className="flex flex-col gap-1.5">
              <label htmlFor={inputId} className="text-2xs font-medium text-text">
                {label}
              </label>
              <div className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="size-11 shrink-0 rounded-panel border border-border"
                  style={{ backgroundColor: swatch }}
                />
                <div className="min-w-0 flex-1">
                  <Input
                    id={inputId}
                    dir="ltr"
                    spellCheck={false}
                    autoComplete="off"
                    value={value}
                    disabled={disabled}
                    placeholder={en.common.notAvailable}
                    error={error}
                    hint={value ? undefined : en.registration.brandColors.usingDefault(swatch)}
                    onChange={(event) => onChange(slot.key, event.target.value)}
                    className="font-mono"
                  />
                </div>
                <input
                  type="color"
                  aria-label={`${label}: ${en.registration.brandColors.pickColor}`}
                  value={swatch}
                  disabled={disabled}
                  onChange={(event) => onChange(slot.key, event.target.value)}
                  className="size-11 shrink-0 cursor-pointer rounded-panel border border-border bg-card p-1 disabled:cursor-not-allowed disabled:bg-neutral-bg"
                />
                {value ? (
                  <button
                    type="button"
                    onClick={() => onChange(slot.key, '')}
                    disabled={disabled}
                    aria-label={`${label}: ${en.registration.brandColors.clear}`}
                    title={en.registration.brandColors.clear}
                    className="flex size-11 shrink-0 items-center justify-center rounded-panel border border-border bg-card text-text-muted transition-colors duration-150 hover:bg-bg-2 hover:text-text disabled:cursor-not-allowed disabled:bg-neutral-bg"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
