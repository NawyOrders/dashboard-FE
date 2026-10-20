import { APPLICATION_REQUIRED_FIELDS } from '@/config/policy';
import { validateEmail, validateName, validatePhone } from '@/domain/rules/validation';
import type { Tenant } from '@/domain/entities';

export function validateApplicationForApprove(tenant: Tenant): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const restaurantName = (tenant.restaurantName || '').trim();
  if (!restaurantName) errors.push('Missing: Restaurant name');

  const ownerName = (((tenant.contact as unknown as Record<string, unknown>)?.name as string) || '').trim();
  if (!ownerName) errors.push('Missing: Owner name');
  else {
    const res = validateName(ownerName, 'branch');
    if (res) errors.push('Invalid: Owner name');
  }

  const ownerEmail = (tenant.contact?.email || '').trim();
  if (!ownerEmail) errors.push('Missing: Owner email');
  else {
    const res = validateEmail(ownerEmail);
    if (res) errors.push('Invalid: Owner email');
  }

  const phone = (tenant.contact?.phone || '').trim();
  if (!phone) errors.push('Missing: Phone');
  else {
    const res = validatePhone(phone, 'phone');
    if (res) errors.push('Invalid: Phone');
  }

  const address = ((((tenant.contact as unknown as Record<string, unknown>)?.address as string)) || ((tenant as unknown as Record<string, unknown>)?.address as string) || '').trim();
  if (!address) errors.push('Missing: Address');

  const branches = tenant.branches || [];
  const hasValidBranch = branches.some((b) => ((b.name || '').trim() && (b.phone || '').trim()));
  if (!hasValidBranch) errors.push('Missing: At least one branch with name and phone');

  return { ok: errors.length === 0, errors };
}

export function getRequiredFieldsList() {
  return APPLICATION_REQUIRED_FIELDS;
}
