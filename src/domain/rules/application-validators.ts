import { APPLICATION_REQUIRED_FIELDS } from '@/config/policy';
import { emailSchema, nameSchema, phoneSchema } from '@/domain/rules/validators';
import type { Tenant } from '@/domain/entities';

export function validateApplicationForApprove(tenant: Tenant): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const restaurantName = tenant.restaurantName?.trim();
  if (!restaurantName) errors.push('Missing: Restaurant name');

  const ownerName = tenant.contact?.name?.trim();
  if (!ownerName) errors.push('Missing: Owner name');
  else {
    const res = nameSchema.safeParse(ownerName);
    if (!res.success) errors.push('Invalid: Owner name');
  }

  const ownerEmail = tenant.contact?.email?.trim();
  if (!ownerEmail) errors.push('Missing: Owner email');
  else {
    const res = emailSchema.safeParse(ownerEmail);
    if (!res.success) errors.push('Invalid: Owner email');
  }

  const phone = tenant.contact?.phone?.trim();
  if (!phone) errors.push('Missing: Phone');
  else {
    const res = phoneSchema.safeParse(phone);
    if (!res.success) errors.push('Invalid: Phone');
  }

  const address = (tenant.contact as any)?.address?.trim?.() ?? (tenant as any).address?.trim?.();
  if (!address) errors.push('Missing: Address');

  const branches = tenant.branches || [];
  const hasValidBranch = branches.some((b) => (b.name?.trim() && b.phone?.trim()));
  if (!hasValidBranch) errors.push('Missing: At least one branch with name and phone');

  return { ok: errors.length === 0, errors };
}

export function getRequiredFieldsList() {
  return APPLICATION_REQUIRED_FIELDS;
}
