import { useState } from 'react';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { SELECT_OPTIONS } from '@/config/cities';
import type { RegistrationField } from '@/domain/rules/registration-schema';
import { validatePhone } from '@/domain/rules/validation';
import { en } from '@/presentation/i18n/en';
import { ImageUploadField } from './ImageUploadField';
import { TextareaField } from './TextareaField';
import type { FieldScope } from './localized-schema';
import { cityLabel, fieldLabel, fieldPlaceholder } from './localized-schema';

export interface SchemaFieldProps {
  field: RegistrationField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Validation message shown under the field. */
  error?: string;
  id: string;
  scope: FieldScope;
}

const INPUT_TYPES: Record<string, string> = {
  text: 'text',
  email: 'email',
  tel: 'tel',
  number: 'number',
  time: 'time',
  digits: 'text',
};

function FieldLabel({
  field,
  scope,
  htmlFor,
}: {
  field: RegistrationField;
  scope: FieldScope;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-2xs font-medium text-text">
      {fieldLabel(field, scope)}
      {field.required ? (
        <>
          <span className="text-danger-fg" aria-hidden="true">
            {' '}
            *
          </span>
          <span className="sr-only">{en.common.requiredSuffix}</span>
        </>
      ) : null}
    </label>
  );
}

/**
 * Renders one JSON field by its `type` (NW-246). The field is never hidden: an empty
 * value renders an empty input carrying the placeholder from the JSON.
 */
export function SchemaField({
  field,
  value,
  onChange,
  disabled,
  error,
  id,
  scope,
}: SchemaFieldProps) {
  // Every phone field shows the Egyptian mobile error as soon as it loses focus.
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError =
    field.type === 'tel' && phoneTouched ? validatePhone(value) : null;

  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col gap-1.5">
        <FieldLabel field={field} scope={scope} htmlFor={id} />
        <TextareaField
          id={id}
          value={value}
          maxLength={field.maxLength}
          disabled={disabled}
          error={error}
          placeholder={fieldPlaceholder(field, scope)}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    const options = (SELECT_OPTIONS[field.key] ?? []).map((option) => ({
      value: option,
      label: cityLabel(option),
    }));
    return (
      <Select
        id={id}
        label={fieldLabel(field, scope)}
        value={value}
        options={options}
        disabled={disabled}
        placeholder={fieldPlaceholder(field, scope)}
        onChange={(event) => onChange(event.target.value)}
        error={error}
      />
    );
  }

  if (field.type === 'image-upload') {
    return (
      <ImageUploadField
        id={id}
        label={fieldLabel(field, scope)}
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
        <span className="text-2xs font-medium text-text">{fieldLabel(field, scope)}</span>
        <span className="flex size-20 items-center justify-center overflow-hidden rounded-panel border border-border bg-bg-2">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-2xs text-text-muted">{en.common.notAvailable}</span>
          )}
        </span>
      </div>
    );
  }

  if (field.type === 'color') {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-medium text-text">{fieldLabel(field, scope)}</span>
        <span className="flex items-center gap-2 text-sm text-text">
          <span
            aria-hidden="true"
            className="size-6 rounded-panel border border-border"
            style={{ backgroundColor: value || 'transparent' }}
          />
          <span className="font-mono text-xs">{value || en.common.notAvailable}</span>
        </span>
      </div>
    );
  }

  const inputType = INPUT_TYPES[field.type] ?? 'text';

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel field={field} scope={scope} htmlFor={id} />
      <Input
        id={id}
        type={inputType}
        inputMode={field.type === 'digits' ? 'numeric' : undefined}
        value={value}
        disabled={disabled}
        readOnly={field.readOnlyInput === true}
        maxLength={field.maxLength}
        placeholder={fieldPlaceholder(field, scope)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          if (field.type === 'tel') setPhoneTouched(true);
        }}
        error={phoneError ?? error}
        min={field.range?.[0]}
        max={field.range?.[1]}
        step={field.type === 'number' ? 'any' : undefined}
      />
    </div>
  );
}
