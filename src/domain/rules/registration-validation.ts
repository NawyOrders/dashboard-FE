import type { Branch, Tenant } from '@/domain/entities';
import type { RegistrationField, RegistrationSchema } from '@/domain/rules/registration-schema';
import { SELECT_OPTIONS } from '@/config/cities';
import { validateEmail } from '@/domain/rules/validation';
import { readBranchField, readSchemaField } from '@/domain/rules/registration-mapping';

export type RegistrationProblemReason =
  | 'required'
  | 'pattern'
  | 'email'
  | 'maxLength'
  | 'minLength'
  | 'range'
  | 'option'
  | 'digits'
  | 'branchCount';

/**
 * One problem found in the registration form. The label is the one of the JSON field, so
 * the summary of the approve validation speaks the language of the schema.
 */
export interface RegistrationProblem {
  fieldKey: string;
  label: string;
  scope: 'field' | 'branch';
  branchId?: string;
  branchIndex?: number;
  reason: RegistrationProblemReason;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
}

export interface RegistrationValidationResult {
  ok: boolean;
  problems: RegistrationProblem[];
}

export interface RegistrationBranchLimits {
  min: number;
  max: number;
}

/**
 * Approve validation driven by the registration schema (NW-246).
 *
 * Every required flag, pattern, maximum length and value range comes from the JSON; the
 * branch count is checked against the limits of the selected package.
 */
export function validateRegistrationForApprove(
  tenant: Tenant,
  schema: RegistrationSchema,
  limits: RegistrationBranchLimits,
): RegistrationValidationResult {
  const problems: RegistrationProblem[] = [];

  for (const step of schema.steps) {
    for (const section of step.sections ?? []) {
      // A read-only section cannot be fixed by the reviewer, so it is not validated.
      if (section.editable === false) continue;
      for (const field of section.fields ?? []) {
        checkField(field, readSchemaField(tenant, field.key), problems, 'field');
      }
    }

    if (step.repeatable === true) {
      const branches = tenant.branches ?? [];
      if (branches.length < limits.min) {
        problems.push({
          fieldKey: 'branches',
          label: step.titleEn,
          scope: 'field',
          reason: 'branchCount',
          min: limits.min,
          max: limits.max,
        });
      }
      branches.forEach((branch, index) => {
        for (const field of step.itemFields ?? []) {
          checkField(field, readBranchField(branch, field.key), problems, 'branch', branch, index);
        }
      });
    }
  }

  return { ok: problems.length === 0, problems };
}

function checkField(
  field: RegistrationField,
  rawValue: string,
  problems: RegistrationProblem[],
  scope: 'field' | 'branch',
  branch?: Branch,
  branchIndex?: number,
): void {
  const value = rawValue.trim();
  const base = {
    fieldKey: field.key,
    label: field.label,
    scope,
    branchId: branch?.id,
    branchIndex,
  };

  if (field.required && value === '') {
    problems.push({ ...base, reason: 'required' });
    return;
  }
  if (value === '') return;

  if (field.minLength && value.length < field.minLength) {
    problems.push({ ...base, reason: 'minLength', minLength: field.minLength });
    return;
  }

  if (field.maxLength && value.length > field.maxLength) {
    problems.push({ ...base, reason: 'maxLength', maxLength: field.maxLength });
    return;
  }

  if (field.type === 'digits' && !/^\d+$/.test(value)) {
    problems.push({ ...base, reason: 'digits' });
    return;
  }

  if (field.pattern && !new RegExp(field.pattern).test(value)) {
    problems.push({ ...base, reason: 'pattern' });
    return;
  }

  if (field.type === 'email' && validateEmail(value)) {
    problems.push({ ...base, reason: 'email' });
    return;
  }

  if (field.type === 'number') {
    const parsed = Number(value);
    const range = field.range;
    if (!Number.isFinite(parsed)) {
      problems.push({ ...base, reason: 'range', min: range?.[0], max: range?.[1] });
      return;
    }
    if (range && (parsed < range[0] || parsed > range[1])) {
      problems.push({ ...base, reason: 'range', min: range[0], max: range[1] });
      return;
    }
  }

  if (field.type === 'select') {
    const options = SELECT_OPTIONS[field.key];
    if (options && !options.includes(value)) {
      problems.push({ ...base, reason: 'option' });
    }
  }
}
