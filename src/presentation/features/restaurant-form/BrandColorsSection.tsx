import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ImageUp, X } from 'lucide-react';
import { api } from '@/app/composition';
import type { LogoPaletteSuggestion } from '@/application/dto';
import { isRgbHexColor } from '@/domain/rules/brand-colors';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import { BRAND_COLOR_SLOTS } from './brand-color-slots';

export interface BrandColorsSectionProps {
  values: Record<string, string>;
  disabled?: boolean;
  /** Validation messages keyed by the JSON field key. */
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Existing logo URL from the application details. */
  logoSrc?: string | null;
  /** Onboarding request, sent as `referenceId` to the palette job. */
  referenceId?: string;
  /** Called with the new asset id after the logo upload resolves. */
  onLogoAssetChange?: (assetId: string) => void;
  /** Called with the palette and its warnings when the job completes; the caller opens the picker. */
  onPaletteSuggested?: (suggestion: LogoPaletteSuggestion) => void;
}

/**
 * Editable brand colors block of the application form. An empty slot keeps the design
 * token as its swatch and clears the stored value (`null`) on save.
 *
 * The logo row uploads through the onboarding asset flow so `logoAssetId` is saved with
 * the PATCH; "Suggest colors from logo" runs the palette job in the same block.
 */
export function BrandColorsSection({
  values,
  disabled,
  errors,
  onChange,
  logoSrc,
  referenceId,
  onLogoAssetChange,
  onPaletteSuggested,
}: BrandColorsSectionProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [paletteRunning, setPaletteRunning] = useState(false);
  const [paletteProgress, setPaletteProgress] = useState<number | null>(null);
  const [paletteError, setPaletteError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!logoPreview) return;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;

    controllerRef.current?.abort();
    controllerRef.current = null;
    setPaletteRunning(false);
    setPaletteProgress(null);
    setPaletteError(null);
    setLogoError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    if (!onLogoAssetChange) return;
    setUploadingLogo(true);
    try {
      const assetId = await api.uploadApplicationLogo(file);
      onLogoAssetChange(assetId);
    } catch {
      setLogoError(en.registration.brandColors.logoUploadFailed);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSuggest() {
    if (!logoFile || !onPaletteSuggested) {
      setPaletteError(en.registration.brandColors.paletteFileRequired);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPaletteRunning(true);
    setPaletteProgress(null);
    setPaletteError(null);

    try {
      const outcome = await api.suggestLogoPalette(logoFile, {
        referenceId,
        signal: controller.signal,
        onProgress: (progress) => {
          if (controller.signal.aborted) return;
          setPaletteProgress(progress.progressPercentage);
        },
      });
      if (controller.signal.aborted) return;

      switch (outcome.status) {
        case 'completed':
          onPaletteSuggested({ colors: outcome.colors, warnings: outcome.warnings });
          break;
        case 'unreadable':
          setPaletteError(en.registration.brandColors.paletteUnreadable);
          break;
        case 'failed':
          setPaletteError(en.registration.brandColors.paletteFailed);
          break;
        case 'timeout':
          setPaletteError(en.menu.timeout);
          break;
      }
    } catch {
      if (!controller.signal.aborted) {
        setPaletteError(en.registration.brandColors.paletteFailed);
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setPaletteRunning(false);
        setPaletteProgress(null);
      }
    }
  }

  const previewSrc = logoPreview ?? logoSrc ?? null;
  const logoLabel = logoFile?.name ?? (logoSrc ? en.registration.brandColors.currentLogo : en.common.notAvailable);

  return (
    <section
      className="flex flex-col gap-3"
      aria-label={en.registration.sections.brand_colors}
    >
      <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-muted">
        {en.registration.sections.brand_colors}
      </h4>

      {onLogoAssetChange ? (
        <div className="relative flex flex-col gap-2 rounded-panel border border-border bg-bg-2/40 p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-panel border border-border bg-card">
                {previewSrc ? (
                  <img src={previewSrc} alt="" className="size-full object-cover" />
                ) : (
                  <ImageUp aria-hidden="true" className="size-5 text-text-muted" />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-2xs font-medium text-text">
                  {en.registration.brandColors.logo}
                </span>
                <span className="truncate text-2xs text-text-muted" title={logoLabel}>
                  {logoLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:ms-auto">
              <label
                htmlFor="rf-logo-file"
                className={cn(
                  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-panel border border-border px-3 text-2xs font-medium text-text',
                  'transition-colors duration-150 hover:bg-bg-2',
                  (disabled || uploadingLogo) && 'pointer-events-none opacity-60',
                )}
              >
                <ImageUp aria-hidden="true" className="size-4" />
                {uploadingLogo
                  ? en.registration.brandColors.uploadingLogo
                  : en.registration.brandColors.chooseLogo}
              </label>
              <input
                id="rf-logo-file"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={disabled || uploadingLogo}
                onChange={(event) => void handleLogoChange(event)}
              />
              {onPaletteSuggested ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  loading={paletteRunning}
                  disabled={disabled || uploadingLogo || paletteRunning}
                  onClick={() => void handleSuggest()}
                >
                  {paletteRunning
                    ? paletteProgress === null
                      ? en.registration.brandColors.paletteRunning
                      : en.registration.brandColors.paletteProgress(paletteProgress)
                    : en.registration.brandColors.suggestFromLogo}
                </Button>
              ) : null}
            </div>
          </div>
          {logoError ? (
            <span role="alert" className="text-2xs text-error">
              {logoError}
            </span>
          ) : null}
          {paletteError ? (
            <span role="alert" className="text-2xs text-error">
              {paletteError}
            </span>
          ) : null}
        </div>
      ) : null}

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
