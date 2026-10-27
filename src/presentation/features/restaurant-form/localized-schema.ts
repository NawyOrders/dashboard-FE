import type { RegistrationField, RegistrationStep } from '@/domain/rules/registration-schema';
import { en } from '@/presentation/i18n/en';

export type FieldScope = 'restaurant' | 'branch';

interface FieldCopy {
  label: string;
  placeholder?: string;
}

interface StepCopy {
  title: string;
  subtitle: string;
  addButton?: string;
  remove?: string;
}

function stepCopy(step: RegistrationStep): StepCopy | undefined {
  const steps = en.registration.steps as Record<string, StepCopy>;
  return steps[step.id];
}

function fieldCopy(scope: FieldScope, key: string): FieldCopy | undefined {
  const fields = en.registration.fields[scope] as unknown as Record<string, FieldCopy>;
  return fields[key];
}

export function stepTitle(step: RegistrationStep): string {
  return stepCopy(step)?.title ?? step.titleEn;
}

export function stepSubtitle(step: RegistrationStep): string {
  return stepCopy(step)?.subtitle ?? step.subtitle;
}

export function stepAddButton(step: RegistrationStep): string {
  return stepCopy(step)?.addButton ?? step.addButtonLabel ?? en.common.create;
}

export function stepRemoveLabel(step: RegistrationStep): string {
  return stepCopy(step)?.remove ?? step.removeLabel ?? en.common.close;
}

export function fieldLabel(field: RegistrationField, scope: FieldScope): string {
  return fieldCopy(scope, field.key)?.label ?? field.label;
}

export function fieldPlaceholder(field: RegistrationField, scope: FieldScope): string {
  const copy = fieldCopy(scope, field.key);
  return copy?.placeholder ?? field.placeholder ?? field.example ?? copy?.label ?? field.label;
}

/** Localized label for a field key reported by registration validation. */
export function fieldLabelByKey(key: string, scope: FieldScope): string | undefined {
  return fieldCopy(scope, key)?.label;
}

export function cityLabel(value: string): string {
  const cities = en.cities as Record<string, string>;
  return cities[value] ?? value;
}
