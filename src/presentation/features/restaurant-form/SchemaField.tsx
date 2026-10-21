import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { SELECT_OPTIONS } from '@/config/cities';
import type { RegistrationField } from '@/domain/rules/registration-schema';
import { ImageUploadField } from './ImageUploadField';
import { TextareaField } from './TextareaField';

export interface SchemaFieldProps {
  field: RegistrationField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Validation message shown under the field. */
  error?: string;
  id: string;
}

const INPUT_TYPES: Record<string, string> = {
  text: 'text',
  email: 'email',
  tel: 'tel',
  number: 'number',
  time: 'time',
};

function FieldLabel({ field, htmlFor }: { field: RegistrationField; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-2xs font-medium text-text">
      {field.label}
      {field.required ? (
        <>
          <span className="text-danger-fg" aria-hidden="true">
            {' '}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  );
}

/**
 * Renders one JSON field by its `type` (NW-246). The field is never hidden: an empty
 * value renders an empty input carrying the placeholder from the JSON.
 */
export function SchemaField({ field, value, onChange, disabled, error, id }: SchemaFieldProps) {
  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col gap-1.5">
        <FieldLabel field={field} htmlFor={id} />
        <TextareaField
          id={id}
          value={value}
          maxLength={field.maxLength}
          disabled={disabled}
          error={error}
          placeholder={field.placeholder ?? field.label}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    const options = (SELECT_OPTIONS[field.key] ?? []).map((option) => ({
      value: option,
      label: option,
    }));
    return (
      <Select
        id={id}
        label={field.label}
        value={value}
        options={options}
        disabled={disabled}
        placeholder={field.placeholder ?? field.example ?? field.label}
        onChange={(event) => onChange(event.target.value)}
        error={error}
      />
    );
  }

  if (field.type === 'image-upload') {
    return (
      <ImageUploadField
        id={id}
        label={field.label}
        value={value}
        disabled={disabled}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (field.type === 'image') {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-medium text-text">{field.label}</span>
        <span className="flex size-20 items-center justify-center overflow-hidden rounded-panel border border-border bg-bg-2">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-2xs text-text-muted">—</span>
          )}
        </span>
      </div>
    );
  }

  if (field.type === 'color') {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-medium text-text">{field.label}</span>
        <span className="flex items-center gap-2 text-sm text-text">
          <span
            aria-hidden="true"
            className="size-6 rounded-panel border border-border"
            style={{ backgroundColor: value || 'transparent' }}
          />
          <span className="font-mono text-xs">{value || '—'}</span>
        </span>
      </div>
    );
  }

  const inputType = INPUT_TYPES[field.type] ?? 'text';

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel field={field} htmlFor={id} />
      <Input
        id={id}
        type={inputType}
        value={value}
        disabled={disabled}
        readOnly={field.readOnlyInput === true}
        maxLength={field.maxLength}
        placeholder={field.placeholder ?? field.label}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        min={field.range?.[0]}
        max={field.range?.[1]}
        step={field.type === 'number' ? 'any' : undefined}
      />
    </div>
  );
}
