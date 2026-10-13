import type { UseCaseDeps } from '@/application/ports';
import type { AdminUser, CreateTenantInput, Subscription, Tenant } from '@/domain/entities';
import { deriveSubscriptionStatus } from '@/domain/rules/subscription';

export function makeCreateRestaurant(deps: UseCaseDeps) {
  return function createRestaurant(input: CreateTenantInput, actor: AdminUser): Tenant {
    const { restaurants, activity, flags, clock, ids } = deps;
    const now = clock.nowIso();
    const id = ids.next('t');
    const index = restaurants.findAll().length + 1;
    const tenantId = `NWY-${String(1000 + index)}`;

    const subscription: Subscription = {
      id: ids.next('sub'),
      tenantId: id,
      packageCode: input.packageCode,
      durationMonths: input.durationMonths,
      status: deriveSubscriptionStatus(input.startDate, input.endDate, clock.now()),
      startDate: input.startDate,
      endDate: input.endDate,
      updatedAt: now,
    };

    const tenant: Tenant = {
      id,
      tenantId,
      businessName: input.businessName,
      restaurantName: input.restaurantName,
      contact: input.contact,
      logoUrl: input.logoUrl,
      brandColors: input.brandColors,
      socialLinks: input.socialLinks,
      status: input.status,
      createdAt: now,
      branches: input.branches.map((branch) => ({ ...branch, id: ids.next('b'), tenantId: id })),
      subscription,
      channels: {
        websiteStatus: null,
        pwaStatus: null,
        websiteUrl: null,
        pwaUrl: null,
        previewUrl: null,
      },
      apps: { android: null, ios: null, androidStoreUrl: null, iosStoreUrl: null },
    };

    restaurants.save(tenant);
    flags.seedDefaults(tenant);
    activity.append({
      actor,
      action: 'restaurant_created',
      target: { type: 'tenant', tenantId: id, label: tenant.restaurantName },
      previousValue: null,
      newValue: `${tenant.restaurantName} (${tenant.tenantId})`,
    });
    return tenant;
  };
}
