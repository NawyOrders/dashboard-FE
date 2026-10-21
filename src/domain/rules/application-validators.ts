import { PACKAGES } from '@/config/packages';
import { requireRegistrationSchema } from '@/config/registration-schema';
import type { Tenant } from '@/domain/entities';
import type { RegistrationProblem } from '@/domain/rules/registration-validation';
import { validateRegistrationForApprove } from '@/domain/rules/registration-validation';

/**
 * Approve validation for a restaurant application (NW-246).
 *
 * The rules live in `domain/rules/registration-validation.ts` and are driven by the
 * registration JSON; this module only formats the result for the callers that still
 * expect a list of messages.
 */

function describe(problem: RegistrationProblem): string {
  const prefix = problem.reason === 'required' ? 'Missing' : 'Invalid';
  const scope =
    problem.scope === 'branch' && problem.branchIndex !== undefined
      ? ` (branch ${problem.branchIndex + 1})`
      : '';
  return `${prefix}: ${problem.label}${scope}`;
}

export function validateApplicationForApprove(tenant: Tenant): { ok: boolean; errors: string[] } {
  const schema = requireRegistrationSchema();
  const limits = PACKAGES[tenant.subscription.packageCode].branchLimits;
  const result = validateRegistrationForApprove(tenant, schema, limits);
  return { ok: result.ok, errors: result.problems.map(describe) };
}
