import type { PackageCode, Tenant } from '@/domain/entities';
import type {
  BillingCycle,
  RegistrationField,
  RegistrationSchema,
  RegistrationStep,
} from '@/domain/rules/registration-schema';
import {
  NUMERIC_BRANCH_FIELDS,
  SCHEMA_BRANCH_FIELD_TO_PATH,
  SCHEMA_FIELD_TO_TENANT_PATH,
  readBranchField,
  readSchemaField,
} from '@/domain/rules/registration-mapping';

/**
 * Value model of the schema-driven registration form (NW-246).
 *
 * Every value the JSON describes is kept in a flat map keyed by the JSON field key, so
 * the renderer stays generic. `toTenantPatch` maps those values back onto the tenant.
 */

export interface BranchFormValue {
  id: string;
  /** Branch values keyed by the JSON `itemFields` key. */
  fields: Record<string, string>;
}

export interface RestaurantFormValues {
  /** Top-level values keyed by the JSON field key. */
  fields: Record<string, string>;
  branches: BranchFormValue[];
  packageCode: PackageCode;
  billingCycle: BillingCycle;
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index]!;
    const next = current[key];
    if (next === null || typeof next !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]!] = value;
}

export function stepsWithSections(schema: RegistrationSchema): RegistrationStep[] {
  return schema.steps.filter((step) => Array.isArray(step.sections) && step.sections.length > 0);
}

export function repeatableStep(schema: RegistrationSchema): RegistrationStep | null {
  return schema.steps.find((step) => step.repeatable === true) ?? null;
}

export function subscriptionStep(schema: RegistrationSchema): RegistrationStep | null {
  return schema.steps.find((step) => step.billingCycle !== undefined) ?? null;
}

/** Builds the initial form values from a tenant (empty fields stay empty strings). */
export function buildFormValues(
  schema: RegistrationSchema,
  tenant: Tenant,
  billingDefault: BillingCycle = 'monthly',
): RestaurantFormValues {
  const fields: Record<string, string> = {};
  for (const step of stepsWithSections(schema)) {
    for (const section of step.sections ?? []) {
      for (const field of section.fields ?? []) {
        fields[field.key] = readSchemaField(tenant, field.key);
      }
    }
  }

  const itemFields = repeatableStep(schema)?.itemFields ?? [];
  const branches: BranchFormValue[] = (tenant.branches ?? []).map((branch, index) => {
    const branchFields: Record<string, string> = {};
    for (const field of itemFields) {
      branchFields[field.key] = readBranchField(branch, field.key);
    }
    return { id: branch.id || `branch_${index + 1}`, fields: branchFields };
  });

  return {
    fields,
    branches,
    packageCode: tenant.subscription.packageCode,
    billingCycle: billingDefault,
  };
}

/** An empty branch row with every `itemFields` key present. */
export function emptyBranch(schema: RegistrationSchema, id: string): BranchFormValue {
  const fields: Record<string, string> = {};
  for (const field of repeatableStep(schema)?.itemFields ?? []) {
    fields[field.key] = '';
  }
  return { id, fields };
}

/**
 * Maps the form values onto a partial tenant. Only the fields the JSON defines are
 * written, so a save never touches anything outside the registration form. Nested
 * objects are rebuilt in full (contact, subscription) so a shallow merge cannot drop
 * data that the form does not show.
 */
export function toTenantPatch(
  values: RestaurantFormValues,
  tenant: Tenant,
): Partial<Tenant> {
  const patch: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values.fields)) {
    const path = SCHEMA_FIELD_TO_TENANT_PATH[key];
    if (!path) continue;
    setPath(patch, path, value);
  }

  const branches = values.branches.map((branch, index) => {
    const original = (tenant.branches ?? []).find((item) => item.id === branch.id);
    const next: Record<string, unknown> = {
      ...(original ?? {}),
      id: branch.id || original?.id || `branch_${index + 1}`,
      tenantId: original?.tenantId ?? tenant.id,
      status: original?.status ?? 'active',
    };
    for (const [key, raw] of Object.entries(branch.fields)) {
      const path = SCHEMA_BRANCH_FIELD_TO_PATH[key];
      if (!path) continue;
      next[path] = NUMERIC_BRANCH_FIELDS.has(key) ? toNumberOrNull(raw) : raw;
    }
    return next;
  });

  patch.branches = branches;
  patch.subscription = { ...tenant.subscription, packageCode: values.packageCode };

  // Keep the parts of the nested objects the form does not show.
  if (patch.contact) {
    patch.contact = { ...tenant.contact, ...(patch.contact as Record<string, unknown>) };
  }
  if (patch.brandColors) {
    patch.brandColors = {
      ...tenant.brandColors,
      ...(patch.brandColors as Record<string, unknown>),
    };
  }

  return patch as Partial<Tenant>;
}

export function toNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** All fields of the schema that are marked required, including branch item fields. */
export function requiredFields(schema: RegistrationSchema): RegistrationField[] {
  const required: RegistrationField[] = [];
  for (const step of schema.steps) {
    for (const section of step.sections ?? []) {
      for (const field of section.fields ?? []) {
        if (field.required) required.push(field);
      }
    }
    for (const field of step.itemFields ?? []) {
      if (field.required) required.push(field);
    }
  }
  return required;
}
