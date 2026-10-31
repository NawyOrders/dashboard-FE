import type { Branch, Tenant } from '@/domain/entities';
import type { RegistrationField, RegistrationSchema } from '@/domain/rules/registration-schema';
import { SELECT_OPTIONS } from '@/config/cities';
import { validateEmail, validatePhone } from '@/domain/rules/validation';
import { validatePassword } from '@/domain/rules/password';
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
  | 'password'
  | 'startDate'
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
  /** The exact message to show, when the reason alone is not specific enough. */
  message?: string;
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
 * The password of the restaurant admin account. NW-247: approving an application
 * creates that account, so the password is checked like every other required field.
 */
export interface ApproveAdminPassword {
  label: string;
  value: string;
}

/**
 * Approve validation driven by the registration schema (NW-246).
 *
 * Every required flag, pattern, maximum length and value range comes from the JSON; the
 * branch count is checked against the limits of the selected package. NW-247: the
 * password of the restaurant admin account is checked the same way.
 */
export function validateRegistrationForApprove(
  tenant: Tenant,
  schema: RegistrationSchema,
  limits: RegistrationBranchLimits,
  adminPassword?: ApproveAdminPassword,
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
      if (branches.length < limits.min || branches.length > limits.max) {
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

  if (adminPassword) {
    const password = adminPassword.value;
    if (password.trim() === '') {
      problems.push({
        fieldKey: 'adminPassword',
        label: adminPassword.label,
        scope: 'field',
        reason: 'required',
      });
    } else {
      const message = validatePassword(password);
      if (message) {
        problems.push({
          fieldKey: 'adminPassword',
          label: adminPassword.label,
          scope: 'field',
          reason: 'password',
          message,
        });
      }
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

  // Every tel field uses the Egyptian mobile rule; the JSON pattern is still the old
  // 7-15 digit / 20-prefix contract and is intentionally not used for phones.
  if (field.type === 'tel') {
    const message = validatePhone(value);
    if (message) {
      problems.push({ ...base, reason: 'pattern', message });
      return;
    }
  } else if (field.pattern && !new RegExp(field.pattern).test(value)) {
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
