import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, Branch, Tenant } from '@/domain/entities';
import type { RegistrationField } from '@/domain/entities/registration-schema';
import { requireRegistrationSchema } from '@/config/registration-schema';
import { readBranchField, readSchemaField } from '@/domain/rules/registration-mapping';

/**
 * Stores the changes of the registration form (NW-246).
 *
 * The patch only carries what the form shows; nested objects are merged so nothing
 * outside the form is lost. Every changed field is written to the activity log with the
 * label of the registration JSON.
 */

// ASSUMPTION: one activity entry per changed field; nothing is logged when nothing changed.

interface FieldChange {
  label: string;
  previous: string | null;
  next: string | null;
  target: 'tenant' | 'branch';
}

function mergeTenant(base: Tenant, patch: Partial<Tenant>): Tenant {
  return {
    ...base,
    ...patch,
    contact: { ...base.contact, ...(patch.contact ?? {}) },
    subscription: { ...base.subscription, ...(patch.subscription ?? {}) },
    brandColors: { ...base.brandColors, ...(patch.brandColors ?? {}) },
  };
}

function branchChanges(
  before: Branch[],
  after: Branch[],
  stepTitle: string,
  itemFields: RegistrationField[],
): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const branch of after) {
    const original = before.find((item) => item.id === branch.id);
    if (!original) {
      changes.push({
        label: `${stepTitle}: ${branch.name || branch.id}`,
        previous: null,
        next: branch.name || branch.id,
        target: 'branch',
      });
      continue;
    }
    for (const field of itemFields) {
      const previous = readBranchField(original, field.key);
      const next = readBranchField(branch, field.key);
      if (previous !== next) {
        changes.push({
          label: `${stepTitle} — ${field.label}`,
          previous: previous || null,
          next: next || null,
          target: 'branch',
        });
      }
    }
  }

  for (const original of before) {
    if (!after.some((item) => item.id === original.id)) {
      changes.push({
        label: `${stepTitle}: ${original.name || original.id}`,
        previous: original.name || original.id,
        next: null,
        target: 'branch',
      });
    }
  }

  return changes;
}

function collectChanges(before: Tenant, after: Tenant): FieldChange[] {
  const schema = requireRegistrationSchema();
  const changes: FieldChange[] = [];

  for (const step of schema.steps) {
    for (const section of step.sections ?? []) {
      for (const field of section.fields) {
        const previous = readSchemaField(before, field.key);
        const next = readSchemaField(after, field.key);
        if (previous !== next) {
          changes.push({
            label: field.label,
            previous: previous || null,
            next: next || null,
            target: 'tenant',
          });
        }
      }
    }

    if (step.repeatable === true) {
      changes.push(
        ...branchChanges(
          before.branches ?? [],
          after.branches ?? [],
          step.titleEn,
          step.itemFields ?? [],
        ),
      );
    }
  }

  return changes;
}

export function makeUpdateApplication(deps: UseCaseDeps) {
  return (tenantId: string, patch: Partial<Tenant>, actor: AdminUser): Tenant => {
    const tenant = deps.restaurants.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');
    const before = JSON.parse(JSON.stringify(tenant)) as Tenant;
    const updated = mergeTenant(before, patch);
    deps.restaurants.save(updated);

    for (const change of collectChanges(before, updated)) {
      deps.activity.append({
        actor,
        action: 'restaurant_details_changed',
        target: {
          type: change.target,
          tenantId,
          label: change.label,
        },
        previousValue: change.previous,
        newValue: change.next,
      });
    }

    return updated;
  };
}
