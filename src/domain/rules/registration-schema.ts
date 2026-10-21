import { z } from 'zod';

/**
 * Runtime validation of `src/config/restaurant-registration-fields.json` (NW-246).
 *
 * The JSON drives the registration form, so a malformed file must break loudly at
 * startup instead of rendering a half-empty form. The parsed result is the typed
 * `RegistrationSchema` the presentation layer consumes; every type below is inferred
 * from this schema, so the validator and the form renderer can never drift apart.
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

const fieldTypeSchema = z.enum(FIELD_TYPES);

const fieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: fieldTypeSchema,
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
  /** Value comes from the map picker, so the input is shown but not typed into. */
  readOnlyInput: z.boolean().optional(),
  range: z.tuple([z.number(), z.number()]).optional(),
  saveBehavior: z.string().optional(),
});

/**
 * A section of a step: the fields to render, or - for a repeatable section - the
 * fields of a single item.
 */
const sectionSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    /** `false` renders the section values as text instead of inputs. */
    editable: z.boolean(),
    fields: z.array(fieldSchema).min(1).optional(),
    itemFields: z.array(fieldSchema).min(1).optional(),
    source: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((section) => section.fields !== undefined || section.itemFields !== undefined, {
    message: 'A section needs either "fields" or "itemFields"',
  });

const mapSchema = z.object({
  library: z.string().min(1),
  tileProvider: z.string().min(1),
  tileUrl: z.string().min(1),
  attribution: z.string(),
  apiKeyRequired: z.boolean(),
  behavior: z.string(),
});

const billingCycleEnumSchema = z.enum(['monthly', 'yearly']);

const billingCycleSchema = z.object({
  options: z.array(billingCycleEnumSchema).min(1),
  default: billingCycleEnumSchema,
  control: z.string().min(1),
  labels: z.object({ monthly: z.string().min(1), yearly: z.string().min(1) }),
});

const packagesSchema = z.object({
  source: z.string().min(1),
  itemShape: z.record(z.string()),
  display: z.string(),
  currency: z.string(),
});

/**
 * A step of the wizard. A step either holds sections, or it repeats a single set of
 * item fields (the branches), or it carries the package selection - which has no
 * fields of its own.
 */
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
    itemFields: z.array(fieldSchema).min(1).optional(),
    map: mapSchema.optional(),
    billingCycle: billingCycleSchema.optional(),
    packages: packagesSchema.optional(),
    submitLabel: z.string().optional(),
  })
  .refine(
    (step) =>
      step.sections !== undefined ||
      step.itemFields !== undefined ||
      step.billingCycle !== undefined ||
      step.packages !== undefined,
    {
      message: 'A step needs "sections", "itemFields", "billingCycle" or "packages"',
    },
  );

const pageSchema = z.object({
  title: z.string().min(1),
  titleEn: z.string().min(1),
  previewPageType: z.string().min(1),
  previewLabel: z.string().min(1),
  previewNote: z.string().min(1),
  layout: z.string().min(1),
  wizardStepCount: z.number().int().positive(),
});

const navigationSchema = z.object({
  buttons: z.object({ next: z.string().min(1), back: z.string().min(1) }),
  rule: z.string(),
});

/**
 * The whole JSON file. The keys are exactly the ones the owner file carries; unknown
 * keys are dropped, so a stray key never reaches the renderer.
 */
export const registrationSchemaSchema = z.object({
  $comment: z.string().optional(),
  version: z.string().min(1),
  page: pageSchema,
  /** Optional: the branch limits come from the package configuration. */
  limits: z
    .object({
      maxBranches: z.number().int().nonnegative(),
      minBranches: z.number().int().nonnegative(),
    })
    .optional(),
  steps: z.array(stepSchema).min(1),
  navigation: navigationSchema,
  previewRules: z.record(z.unknown()),
  outOfScope: z.array(z.string()),
  openQuestions: z.array(z.string()),
});

export type RegistrationFieldType = z.infer<typeof fieldTypeSchema>;
export type BillingCycle = z.infer<typeof billingCycleEnumSchema>;
export type RegistrationField = z.infer<typeof fieldSchema>;
export type RegistrationSection = z.infer<typeof sectionSchema>;
export type RegistrationMapConfig = z.infer<typeof mapSchema>;
export type RegistrationBillingCycle = z.infer<typeof billingCycleSchema>;
export type RegistrationPackagesConfig = z.infer<typeof packagesSchema>;
export type RegistrationStep = z.infer<typeof stepSchema>;
export type RegistrationPageConfig = z.infer<typeof pageSchema>;
export type RegistrationNavigation = z.infer<typeof navigationSchema>;
export type RegistrationSchema = z.infer<typeof registrationSchemaSchema>;

export type RegistrationSchemaParseResult =
  | { ok: true; schema: RegistrationSchema }
  | { ok: false; issues: string[] };

/** Validates the raw JSON. Returns the typed schema or a list of human-readable issues. */
export function parseRegistrationSchema(input: unknown): RegistrationSchemaParseResult {
  const result = registrationSchemaSchema.safeParse(input);
  if (result.success) {
    return { ok: true, schema: result.data };
  }
  const issues = result.error.issues.map(
    (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
  );
  return { ok: false, issues };
}
