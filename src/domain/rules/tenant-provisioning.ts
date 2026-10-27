/**
 * Comparisons for the tenant provisioning status (agent.md section 26).
 *
 * OPEN: status values from backend (the contract does not enumerate them). Only
 * `active` and `failed` are treated as final by the dashboard.
 */

const FINAL_STATUSES = new Set(['active', 'failed']);

function normalized(status: string): string {
  return status.trim().toLowerCase();
}

export function isTenantProvisioningFinal(status: string): boolean {
  return FINAL_STATUSES.has(normalized(status));
}

export function isTenantProvisioningActive(status: string): boolean {
  return normalized(status) === 'active';
}

export function isTenantProvisioningFailed(status: string): boolean {
  return normalized(status) === 'failed';
}
