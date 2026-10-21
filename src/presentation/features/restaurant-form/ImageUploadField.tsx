import { useRef, useState } from 'react';
import { ImageUp, X } from 'lucide-react';
import { api } from '@/app/composition';
import { cn } from '@/presentation/lib/cn';
import { en } from '@/presentation/i18n/en';

export interface ImageUploadFieldProps {
  label: string;
  /** Current image reference (a data URL in the mock). */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  error?: string;
}

/**
 * Image upload field (NW-246).
 *
 * The file goes through the upload port; the mock adapter returns a data URL that is
 * stored with the application until a real upload endpoint exists.
 */
export function ImageUploadField({ label, value, onChange, disabled, id, error }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setFailure(null);
    setUploading(true);
    try {
      const stored = await api.uploadImage(file);
      onChange(stored);
    } catch {
      setFailure(en.registration.uploadError);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2xs font-medium text-text">{label}</span>

      <div className="flex items-center gap-3">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-panel border border-border bg-bg-2">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImageUp aria-hidden="true" className="size-5 text-text-muted" />
          )}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={id}
            className={cn(
              'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-panel border border-border px-3 text-2xs font-medium text-text',
              'transition-colors duration-150 hover:bg-bg-2 disabled:cursor-not-allowed disabled:text-text-muted',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            <ImageUp aria-hidden="true" className="size-4" />
            {uploading ? en.registration.uploading : en.registration.chooseImage}
          </label>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/*"
            disabled={disabled || uploading}
            className="sr-only"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          {value ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('')}
              className="inline-flex size-9 items-center justify-center rounded-panel text-text-muted transition-colors duration-150 hover:bg-bg-2 hover:text-text disabled:cursor-not-allowed disabled:text-text-muted"
              aria-label={en.registration.removeImage}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {error ? <span className="text-2xs text-error">{error}</span> : null}
      {!error && failure ? <span className="text-2xs text-error">{failure}</span> : null}
    </div>
  );
}
