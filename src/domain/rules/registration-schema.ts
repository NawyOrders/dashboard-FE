import { z } from 'zod';
import type { RegistrationSchema } from '@/domain/entities/registration-schema';

/**
 * Runtime validation of `src/config/restaurant-registration-fields.json` (NW-246).
 *
 * The JSON drives the registration form, so a malformed file must break loudly at
 * startup instead of rendering a half-empty form. The parsed result is the typed
 * `RegistrationSchema` the presentation layer consumes.
 */

const FIELD_TYPES = [
  'text',
  'email',
  'tel',
  'number',
  'textarea',
  'select',
  'time',
  'image-upload',
  'image',
  'color',
] as const;

const fieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().optional(),
  maxLength: z.number().int().positive().optional(),
  placeholder: z.string().optional(),
  pattern: z.string().optional(),
  options: z.string().optional(),
  example: z.string().optional(),
  previewTarget: z.string().nullable().optional(),
  fallback: z.string().optional(),
  fallbackToken: z.string().optional(),
  note: z.string().optional(),
  editable: z.boolean().optional(),
  source: z.string().optional(),
  readOnlyInput: z.boolean().optional(),
  range: z.tuple([z.number(), z.number()]).optional(),
  saveBehavior: z.string().optional(),
});

const sectionSchema = z.object({
  id: z.string().min(1),
  editable: z.boolean(),
  fields: z.array(fieldSchema).min(1),
  source: z.string().optional(),
});

const mapSchema = z.object({
  library: z.string().min(1),
  tileProvider: z.string().min(1),
  tileUrl: z.string().min(1),
  attribution: z.string(),
  apiKeyRequired: z.boolean(),
  behavior: z.string(),
});

const billingCycleSchema = z.object({
  options: z.array(z.enum(['monthly', 'yearly'])).min(1),
  default: z.enum(['monthly', 'yearly']),
  control: z.string().min(1),
  labels: z.object({ monthly: z.string().min(1), yearly: z.string().min(1) }),
});

const packagesSchema = z.object({
  source: z.string().min(1),
  itemShape: z.record(z.string()),
  display: z.string(),
  currency: z.string(),
});

const stepSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().positive(),
    title: z.string().min(1),
    titleEn: z.string().min(1),
    subtitle: z.string(),
    sections: z.array(sectionSchema).optional(),
    repeatable: z.boolean().optional(),
    minItems: z.number().int().nonnegative().optional(),
    maxItems: z.number().int().nonnegative().optional(),
    addButtonLabel: z.string().min(1).optional(),
    removeLabel: z.string().min(1).optional(),
    previewTarget: z.string().optional(),
    itemFields: z.array(fieldSchema).optional(),
    map: mapSchema.optional(),
    billingCycle: billingCycleSchema.optional(),
    packages: packagesSchema.optional(),
    submitLabel: z.string().optional(),
  })
  .refine((step) => step.sections !== undefined || step.itemFields !== undefined, {
    message: 'A step needs either "sections" or "itemFields"',
  });

export const registrationSchemaSchema = z.object({
  version: z.string().min(1),
  page: z.object({
    title: z.string().min(1),
    titleEn: z.string().min(1),
    previewPageType: z.string().min(1),
    previewLabel: z.string().min(1),
    previewNote: z.string().min(1),
    layout: z.string().min(1),
    wizardStepCount: z.number().int().positive(),
  }),
  limits: z.object({
    maxBranches: z.number().int().nonnegative(),
    minBranches: z.number().int().nonnegative(),
  }),
  steps: z.array(stepSchema).min(1),
  navigation: z.object({
    buttons: z.object({ next: z.string().min(1), back: z.string().min(1) }),
    rule: z.string(),
  }),
  previewRules: z.record(z.unknown()),
  outOfScope: z.array(z.string()),
  openQuestions: z.array(z.string()),
});

export type RegistrationSchemaParseResult =
  | { ok: true; schema: RegistrationSchema }
  | { ok: false; issues: string[] };

/** Validates the raw JSON. Returns the typed schema or a list of human-readable issues. */
export function parseRegistrationSchema(input: unknown): RegistrationSchemaParseResult {
  const result = registrationSchemaSchema.safeParse(input);
  if (result.success) {
    return { ok: true, schema: result.data as RegistrationSchema };
  }
  const issues = result.error.issues.map(
    (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
  );
  return { ok: false, issues };
}
