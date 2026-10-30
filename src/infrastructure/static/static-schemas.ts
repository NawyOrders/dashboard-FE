import { z } from 'zod';
import type {
  Account,
  ActivityLog,
  PlatformLoginResponse,
  PlatformRole,
  SalesRecord,
  Tenant,
} from '@/domain/entities';

const packageCodeSchema = z.enum(['start', 'growth']);
const durationMonthsSchema = z.union([z.literal(3), z.literal(6), z.literal(12)]);
const restaurantStatusSchema = z.enum([
  'active',
  'inactive',
  'pending',
  'pending_approval',
  'approved',
]);
const branchStatusSchema = z.enum(['active', 'pending', 'inactive']);
const subscriptionStatusSchema = z.enum(['active', 'expiring_soon', 'expired', 'not_started']);
const channelStatusSchema = z.enum(['ready', 'in_setup', 'not_tracked']);
const appStatusSchema = z.enum([
  'not_started',
  'in_preparation',
  'submitted_to_store',
  'published',
]);
const paymentStatusSchema = z.enum(['paid', 'unpaid']);

const branchSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  status: branchStatusSchema,
  openTime: z.string().nullish(),
  closeTime: z.string().nullish(),
  menuImageUrl: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

export const tenantSchema: z.ZodType<Tenant> = z.object({
  id: z.string(),
  tenantId: z.string(),
  businessName: z.string(),
  restaurantName: z.string(),
  restaurantNameAr: z.string().nullish(),
  contact: z.object({
    phone: z.string(),
    email: z.string(),
    name: z.string().optional(),
    city: z.string().nullish(),
  }),
  logoUrl: z.string().nullable(),
  brandColors: z.object({
    primary: z.string(),
    secondary: z.string(),
  }),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    website: z.string().optional(),
  }),
  status: restaurantStatusSchema,
  createdAt: z.string(),
  branches: z.array(branchSchema),
  subscription: z.object({
    id: z.string(),
    tenantId: z.string(),
    packageCode: packageCodeSchema,
    durationMonths: durationMonthsSchema,
    status: subscriptionStatusSchema,
    startDate: z.string(),
    endDate: z.string(),
    updatedAt: z.string(),
  }),
  channels: z.object({
    websiteStatus: channelStatusSchema.nullable(),
    pwaStatus: channelStatusSchema.nullable(),
    websiteUrl: z.string().nullable(),
    pwaUrl: z.string().nullable(),
    previewUrl: z.string().nullable(),
  }),
  apps: z.object({
    android: appStatusSchema.nullable(),
    ios: appStatusSchema.nullable(),
    androidStoreUrl: z.string().nullable(),
    iosStoreUrl: z.string().nullable(),
  }),
  description: z.string().nullish(),
  coverImageUrl: z.string().nullish(),
  commercialRegisterNumber: z.string().nullish(),
  paymentStatus: paymentStatusSchema.optional(),
  submittedAtUtc: z.string().nullish(),
  agreedPrice: z.number().nullish(),
  agreedCurrency: z.string().nullish(),
  onboardingStatus: z.number().int().optional(),
});

export const tenantsSchema = z.array(tenantSchema);

export const salesRecordSchema: z.ZodType<SalesRecord> = z.object({
  id: z.string(),
  tenantId: z.string().optional(),
  date: z.string(),
  amountEgp: z.number(),
});

export const salesSchema = z.array(salesRecordSchema);

const internalAccountSchema = z.object({
  id: z.string(),
  accountType: z.literal('internal'),
  name: z.string(),
  email: z.string(),
  status: z.enum(['active', 'inactive']),
  role: z.enum(['super_admin', 'support']),
  createdAt: z.string(),
});

const tenantAccountSchema = z.object({
  id: z.string(),
  accountType: z.literal('tenant'),
  name: z.string(),
  email: z.string(),
  status: z.enum(['active', 'inactive']),
  tenantId: z.string(),
  restaurantRole: z.enum(['admin', 'cashier', 'waiter', 'kitchen', 'manager']),
  createdAt: z.string(),
});

export const accountSchema: z.ZodType<Account> = z.discriminatedUnion('accountType', [
  internalAccountSchema,
  tenantAccountSchema,
]);

export const accountsSchema = z.array(accountSchema);

const activityActionSchema = z.enum([
  'restaurant_created',
  'package_changed',
  'duration_changed',
  'subscription_dates_changed',
  'restaurant_status_changed',
  'subscription_status_changed',
  'feature_toggled',
  'branch_added',
  'support_access',
  'account_created',
  'account.password_changed',
  'account.password_reset',
  'application_approved',
  'restaurant_details_changed',
]);

export const activityLogSchema: z.ZodType<ActivityLog> = z.object({
  id: z.string(),
  timestamp: z.string(),
  actor: z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(['super_admin', 'support']),
  }),
  action: activityActionSchema,
  target: z.object({
    type: z.enum(['tenant', 'subscription', 'feature', 'branch', 'account']),
    tenantId: z.string().optional(),
    label: z.string(),
  }),
  previousValue: z.string().nullable(),
  newValue: z.string().nullable(),
});

export const activityLogsSchema = z.array(activityLogSchema);

export const loginFixtureSchema = z.object({
  email: z.string(),
  password: z.string(),
  userId: z.string(),
  fullName: z.string(),
  roles: z.array(z.string()),
  accountType: z.enum(['internal', 'tenant']),
  tenantId: z.string().optional(),
  isActive: z.boolean(),
  isLockedOut: z.boolean(),
});

export const loginFixturesSchema = z.object({
  users: z.array(loginFixtureSchema),
});

export type LoginFixture = z.infer<typeof loginFixtureSchema>;

export const platformRoleSchema: z.ZodType<PlatformRole> = z.enum(['SuperAdmin', 'Support']);

/** Validates the static adapter's platform-login response at the infrastructure boundary. */
export const platformLoginResponseSchema: z.ZodType<PlatformLoginResponse> = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
  roles: z.array(platformRoleSchema).min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAtUtc: z.string().datetime(),
  refreshTokenExpiresAtUtc: z.string().datetime(),
  tokenType: z.literal('Bearer'),
});
