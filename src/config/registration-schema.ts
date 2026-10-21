import rawRegistrationSchema from '@/config/restaurant-registration-fields.json';
import { parseRegistrationSchema } from '@/domain/rules/registration-schema';
import type { RegistrationSchema } from '@/domain/entities/registration-schema';

/**
 * The owner-supplied JSON is the single source of truth for the registration form
 * (NW-246). It is validated once at startup; an invalid file stops the app from
 * rendering (see `src/main.tsx`) instead of producing a half-empty form.
 */

const parsed = parseRegistrationSchema(rawRegistrationSchema);

/** Human-readable validation issues; empty when the schema is valid. */
export const REGISTRATION_SCHEMA_ISSUES: string[] = parsed.ok ? [] : parsed.issues;

/** The validated schema, or `null` when the JSON file is malformed. */
export const REGISTRATION_SCHEMA: RegistrationSchema | null = parsed.ok ? parsed.schema : null;

/**
 * Accessor for code that can only run once the schema has been validated.
 * The startup gate renders an error screen before any of it runs.
 */
export function requireRegistrationSchema(): RegistrationSchema {
  if (!REGISTRATION_SCHEMA) {
    throw new Error(
      `Restaurant registration schema is invalid: ${REGISTRATION_SCHEMA_ISSUES.join('; ')}`,
    );
  }
  return REGISTRATION_SCHEMA;
}
