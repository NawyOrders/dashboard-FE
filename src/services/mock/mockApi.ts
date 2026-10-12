import type { AddBranchInput, Api, ListActivityParams, ListTenantsParams, UpdateSubscriptionInput } from '@/services/api';
import type {
  ActivityLog,
  AdminUser,
  Branch,
  CreateTenantInput,
  FeatureFlag,
  PackageDefinition,
  PackageFeatureKey,
  RestaurantStatus,
  Subscription,
  SubscriptionStatus,
  Tenant,
} from '@/types';
import { PACKAGE_LIST, PACKAGES, packageHasFeature } from '@/config/packages';
import { canEnableFeature } from '@/config/features';
import { EXPIRING_SOON_DAYS } from '@/config/policy';
import { isExpiringSoon } from '@/lib/subscription';
import { parseIsoDate, startOfToday } from '@/lib/date';
import { buildSeedActivity, buildSeedTenants } from './seed';

const CURRENT_USER: AdminUser = {
  id: 'u_1',
  name: 'Nour Hassan',
  email: 'nour.hassan@nawy.example.com',
  role: 'super_admin',
};

function delay(): Promise<void> {
  const ms = 300 + Math.random() * 300;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function forcedErrorActive(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('mockError') === '1';
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

class MockApi implements Api {
  private tenants: Tenant[] = buildSeedTenants();
  private logs: ActivityLog[] = buildSeedActivity(this.tenants);
  private flags = new Map<string, FeatureFlag[]>();

  constructor() {
    for (const tenant of this.tenants) {
      this.flags.set(tenant.id, this.defaultFlags(tenant));
    }
  }

  private defaultFlags(tenant: Tenant): FeatureFlag[] {
    const toggleable: PackageFeatureKey[] = ['website', 'pwa', 'admin_panel', 'android_app', 'ios_app'];
    return toggleable.map((key) => ({
      tenantId: tenant.id,
      key,
      enabled: packageHasFeature(tenant.subscription.packageCode, key),
      updatedAt: tenant.subscription.updatedAt,
    }));
  }

  private async run<T>(fn: () => T): Promise<T> {
    await delay();
    if (forcedErrorActive()) {
      throw new Error('Simulated API error (mockError=1)');
    }
    return clone(fn());
  }

  private require(tenantId: string): Tenant {
    const tenant = this.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);
    return tenant;
  }

  private log(entry: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    this.logs.unshift({
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    });
  }

  async getCurrentUser(): Promise<AdminUser> {
    return this.run(() => CURRENT_USER);
  }

  async listTenants(params: ListTenantsParams = {}): Promise<Tenant[]> {
    return this.run(() => {
      let result = [...this.tenants];
      const search = params.search?.trim().toLowerCase();

      if (search) {
        result = result.filter(
          (t) =>
            t.restaurantName.toLowerCase().includes(search) ||
            t.businessName.toLowerCase().includes(search) ||
            t.tenantId.toLowerCase().includes(search),
        );
      }
      if (params.packageCode) {
        result = result.filter((t) => t.subscription.packageCode === params.packageCode);
      }
      if (params.restaurantStatus) {
        result = result.filter((t) => t.status === params.restaurantStatus);
      }
      if (params.subscriptionStatus) {
        result = result.filter((t) => t.subscription.status === params.subscriptionStatus);
      }
      if (params.growthOnly) {
        result = result.filter((t) => t.subscription.packageCode === 'growth');
      }
      if (params.expiringSoon) {
        result = result.filter((t) => isExpiringSoon(t.subscription));
      }

      switch (params.sort) {
        case 'oldest':
          result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          break;
        case 'name_asc':
          result.sort((a, b) => a.restaurantName.localeCompare(b.restaurantName));
          break;
        case 'expiry_asc':
          result.sort((a, b) => a.subscription.endDate.localeCompare(b.subscription.endDate));
          break;
        case 'newest':
        default:
          result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          break;
      }
      return result;
    });
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    return this.run(() => this.require(tenantId));
  }

  async createTenant(input: CreateTenantInput, actor: AdminUser): Promise<Tenant> {
    return this.run(() => {
      const index = this.tenants.length + 1;
      const id = `t_${Date.now()}`;
      const tenantId = `NWY-${String(1000 + index)}`;
      const now = new Date().toISOString();

      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        tenantId: id,
        packageCode: input.packageCode,
        durationMonths: input.durationMonths,
        status: this.deriveStatus(input.startDate, input.endDate),
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
        branches: input.branches.map((branch, b) => ({ ...branch, id: `b_${id}_${b}`, tenantId: id })),
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

      this.tenants.push(tenant);
      this.flags.set(id, this.defaultFlags(tenant));
      this.log({
        actor,
        action: 'restaurant_created',
        target: { type: 'tenant', tenantId: id, label: tenant.restaurantName },
        previousValue: null,
        newValue: `${tenant.restaurantName} (${tenant.tenantId})`,
      });
      return tenant;
    });
  }

  private deriveStatus(start: string, end: string): SubscriptionStatus {
    const today = startOfToday();
    const startDate = parseIsoDate(start);
    const endDate = parseIsoDate(end);
    if (startDate && startDate > today) return 'not_started';
    if (endDate && endDate < today) return 'expired';
    if (endDate && endDate.getTime() - today.getTime() <= EXPIRING_SOON_DAYS * 86_400_000) {
      return 'expiring_soon';
    }
    return 'active';
  }

  async updateSubscription(
    tenantId: string,
    input: UpdateSubscriptionInput,
    actor: AdminUser,
  ): Promise<Tenant> {
    return this.run(() => {
      const tenant = this.require(tenantId);
      const prev = { ...tenant.subscription };
      const now = new Date().toISOString();

      tenant.subscription = {
        ...tenant.subscription,
        packageCode: input.packageCode,
        durationMonths: input.durationMonths,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        updatedAt: now,
      };

      // Changing to Start must also revoke Growth-only features.
      if (prev.packageCode !== input.packageCode) {
        this.log({
          actor,
          action: 'package_changed',
          target: { type: 'subscription', tenantId, label: `${tenant.restaurantName} — subscription` },
          previousValue: PACKAGES[prev.packageCode].name,
          newValue: PACKAGES[input.packageCode].name,
        });
        const flags = this.flags.get(tenantId) ?? [];
        for (const flag of flags) {
          if (!packageHasFeature(input.packageCode, flag.key)) {
            flag.enabled = false;
          }
        }
      }
      if (prev.durationMonths !== input.durationMonths) {
        this.log({
          actor,
          action: 'duration_changed',
          target: { type: 'subscription', tenantId, label: `${tenant.restaurantName} — subscription` },
          previousValue: `${prev.durationMonths} months`,
          newValue: `${input.durationMonths} months`,
        });
      }
      if (prev.status !== input.status) {
        this.log({
          actor,
          action: 'subscription_status_changed',
          target: { type: 'subscription', tenantId, label: `${tenant.restaurantName} — subscription` },
          previousValue: prev.status,
          newValue: input.status,
        });
      }
      if (prev.startDate !== input.startDate || prev.endDate !== input.endDate) {
        this.log({
          actor,
          action: 'subscription_dates_changed',
          target: { type: 'subscription', tenantId, label: `${tenant.restaurantName} — subscription` },
          previousValue: `${prev.startDate} → ${prev.endDate}`,
          newValue: `${input.startDate} → ${input.endDate}`,
        });
      }

      return tenant;
    });
  }

  async updateRestaurantStatus(
    tenantId: string,
    status: RestaurantStatus,
    actor: AdminUser,
  ): Promise<Tenant> {
    return this.run(() => {
      const tenant = this.require(tenantId);
      const previous = tenant.status;
      tenant.status = status;
      this.log({
        actor,
        action: 'restaurant_status_changed',
        target: { type: 'tenant', tenantId, label: tenant.restaurantName },
        previousValue: previous,
        newValue: status,
      });
      return tenant;
    });
  }

  async setFeatureFlag(
    tenantId: string,
    key: PackageFeatureKey,
    enabled: boolean,
    actor: AdminUser,
  ): Promise<FeatureFlag> {
    return this.run(() => {
      const tenant = this.require(tenantId);
      if (!canEnableFeature(tenant.subscription.packageCode, key, enabled)) {
        throw new Error(`Feature "${key}" is not available on the ${PACKAGES[tenant.subscription.packageCode].name} package`);
      }
      const flags = this.flags.get(tenantId) ?? [];
      let flag = flags.find((f) => f.key === key);
      if (!flag) {
        flag = { tenantId, key, enabled: false, updatedAt: new Date().toISOString() };
        flags.push(flag);
        this.flags.set(tenantId, flags);
      }
      const previous = flag.enabled;
      flag.enabled = enabled;
      flag.updatedAt = new Date().toISOString();
      this.log({
        actor,
        action: 'feature_toggled',
        target: { type: 'feature', tenantId, label: `${tenant.restaurantName} — ${key}` },
        previousValue: previous ? 'Enabled' : 'Disabled',
        newValue: enabled ? 'Enabled' : 'Disabled',
      });
      return flag;
    });
  }

  async listFeatureFlags(tenantId: string): Promise<FeatureFlag[]> {
    return this.run(() => {
      this.require(tenantId);
      return this.flags.get(tenantId) ?? [];
    });
  }

  async addBranch(tenantId: string, input: AddBranchInput, actor: AdminUser): Promise<Branch> {
    return this.run(() => {
      const tenant = this.require(tenantId);
      const branch: Branch = {
        ...input,
        id: `b_${Date.now()}`,
        tenantId,
      };
      tenant.branches.push(branch);
      this.log({
        actor,
        action: 'branch_added',
        target: { type: 'branch', tenantId, label: `${tenant.restaurantName} — ${branch.name}` },
        previousValue: null,
        newValue: branch.name,
      });
      return branch;
    });
  }

  async listActivity(params: ListActivityParams = {}): Promise<ActivityLog[]> {
    return this.run(() => {
      let result = [...this.logs];
      if (params.tenantId) {
        result = result.filter((log) => log.target.tenantId === params.tenantId);
      }
      if (params.action) {
        result = result.filter((log) => log.action === params.action);
      }
      if (params.from) {
        result = result.filter((log) => log.timestamp.slice(0, 10) >= params.from!);
      }
      if (params.to) {
        result = result.filter((log) => log.timestamp.slice(0, 10) <= params.to!);
      }
      return result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    });
  }

  async listPackages(): Promise<PackageDefinition[]> {
    return this.run(() => PACKAGE_LIST);
  }
}

export const mockApi = new MockApi();
