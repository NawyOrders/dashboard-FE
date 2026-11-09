import {
  commercialRegisterMaxLength,
  commercialRegisterMinLength,
} from '@/config/validation';
import type { RegistrationField, RegistrationSchema } from '@/domain/rules/registration-schema';

/**
 * Dashboard-only registration fields (NW-247).
 *
 * The owner file `src/config/restaurant-registration-fields.json` stays the source of truth
 * for the registration form and is never edited by the app; the field below is added to the
 * schema at load time, so the form, the validation and the activity log keep working with
 * one schema instead of hard-coding a field in a component.
 */

/** Section of the registration schema that carries the restaurant details. */
const RESTAURANT_DETAILS_SECTION_ID = 'owner_and_restaurant';

/**
 * The commercial register number of the restaurant. It is optional: an empty value is
 * valid, a filled value must be digits only and exactly
 * `commercialRegisterMinLength` … `commercialRegisterMaxLength` characters long.
 */
export const COMMERCIAL_REGISTER_FIELD: RegistrationField = {
  key: 'commercialRegisterNumber',
  label: 'Commercial register number (optional)',
  type: 'digits',
  required: false,
  minLength: commercialRegisterMinLength,
  maxLength: commercialRegisterMaxLength,
  placeholder: '15 digits',
};

/**
 * Adds the dashboard fields to the parsed registration schema.
 *
 * The commercial register number belongs to the restaurant-details section; when that
 * section is missing, the first editable section of the schema takes it, so the field is
 * never silently dropped.
 */
export function withDashboardFields(schema: RegistrationSchema): RegistrationSchema {
  const steps = schema.steps.map((step) => ({
    ...step,
    sections: step.sections?.map((section) =>
      section.id === RESTAURANT_DETAILS_SECTION_ID
        ? { ...section, fields: [...(section.fields ?? []), COMMERCIAL_REGISTER_FIELD] }
        : section,
    ),
  }));

  const hasDetailsSection = steps.some((step) =>
    step.sections?.some((section) => section.id === RESTAURANT_DETAILS_SECTION_ID),
  );
  if (hasDetailsSection) return { ...schema, steps };

  const fallback = steps.find((step) =>
    step.sections?.some((section) => section.editable !== false),
  );
  if (!fallback) return { ...schema, steps };

  return {
    ...schema,
    steps: steps.map((step) =>
      step.id === fallback.id
        ? {
            ...step,
            sections: step.sections?.map((section, index) =>
              index === 0
                ? { ...section, fields: [...(section.fields ?? []), COMMERCIAL_REGISTER_FIELD] }
                : section,
            ),
          }
        : step,
    ),
  };
}
