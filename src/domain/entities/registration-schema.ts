/**
 * Typed model of `src/config/restaurant-registration-fields.json` (NW-246).
 *
 * The JSON file is the single source of truth for the restaurant registration form.
 * This module describes its shape for the domain layer; the runtime validation lives in
 * `domain/rules/registration-schema.ts` (zod).
 */

export type RegistrationFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'textarea'
  | 'select'
  | 'time'
  | 'image-upload'
  | 'image'
  | 'color';

export type BillingCycle = 'monthly' | 'yearly';

export interface RegistrationField {
  key: string;
  label: string;
  type: RegistrationFieldType;
  /** Present and `true` means the field must have a value before an application is approved. */
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  /** Regex source the value must match (JSON string, used as-is). */
  pattern?: string;
  /** Free-text description of where the options come from. */
  options?: string;
  example?: string;
  previewTarget?: string | null;
  fallback?: string;
  fallbackToken?: string;
  note?: string;
  editable?: boolean;
  source?: string;
  /** Value comes from the map picker, so the input is shown but not typed into. */
  readOnlyInput?: boolean;
  range?: [number, number];
  saveBehavior?: string;
}

export interface RegistrationSection {
  id: string;
  /** `false` renders the section values as text instead of inputs. */
  editable: boolean;
  fields: RegistrationField[];
  source?: string;
}

export interface RegistrationMapConfig {
  library: string;
  tileProvider: string;
  tileUrl: string;
  attribution: string;
  apiKeyRequired: boolean;
  behavior: string;
}

export interface RegistrationBillingCycle {
  options: BillingCycle[];
  default: BillingCycle;
  control: string;
  labels: Record<BillingCycle, string>;
}

export interface RegistrationPackagesConfig {
  source: string;
  itemShape: Record<string, string>;
  display: string;
  currency: string;
}

export interface RegistrationStep {
  id: string;
  order: number;
  title: string;
  titleEn: string;
  subtitle: string;
  /** Normal steps carry `sections`; repeatable steps carry `itemFields`. */
  sections?: RegistrationSection[];
  repeatable?: boolean;
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  removeLabel?: string;
  previewTarget?: string;
  itemFields?: RegistrationField[];
  map?: RegistrationMapConfig;
  billingCycle?: RegistrationBillingCycle;
  packages?: RegistrationPackagesConfig;
  submitLabel?: string;
}

export interface RegistrationPageConfig {
  title: string;
  titleEn: string;
  previewPageType: string;
  previewLabel: string;
  previewNote: string;
  layout: string;
  wizardStepCount: number;
}

export interface RegistrationNavigation {
  buttons: { next: string; back: string };
  rule: string;
}

export interface RegistrationSchema {
  version: string;
  page: RegistrationPageConfig;
  limits: { maxBranches: number; minBranches: number };
  steps: RegistrationStep[];
  navigation: RegistrationNavigation;
  previewRules: Record<string, unknown>;
  outOfScope: string[];
  openQuestions: string[];
}
