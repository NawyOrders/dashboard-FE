import type {
  ActivityLog,
  AppStatus,
  ChannelStatus,
  DurationMonths,
  PackageCode,
  RestaurantStatus,
  SalesRecord,
  SubscriptionStatus,
  Tenant,
  TenantRole,
} from '@/domain/entities';
import type { SeedAuthAccount } from '@/infrastructure/repositories/in-memory-auth-repository';
import { CITY_OPTIONS } from '@/config/cities';
import { addDays, addMonths, startOfToday, toIsoDate } from '@/domain/rules/date';

interface SeedDescriptor {
  name: string;
  slug: string;
  packageCode: PackageCode;
  durationMonths: DurationMonths;
  subStatus: SubscriptionStatus;
  restStatus: RestaurantStatus;
  /** Days relative to today for the subscription start date. */
  startOffset: number;
  websiteStatus: ChannelStatus | null;
  pwaStatus: ChannelStatus | null;
  android: AppStatus | null;
  ios: AppStatus | null;
  branches: number;
  colors: [string, string];
}

const PALETTE: Array<[string, string]> = [
  ['#E43820', '#FFB199'],
  ['#167A3E', '#A7E3BC'],
  ['#1F4FB4', '#B9CCF7'],
  ['#7A4A00', '#F6D08A'],
  ['#5B2A86', '#D4BEEB'],
  ['#0E7490', '#A5E3EE'],
  ['#B8251A', '#F3B7AF'],
  ['#3F3F46', '#D4D4D8'],
];

const DESCRIPTORS: SeedDescriptor[] = [
  { name: 'Acme Grill', slug: 'acme-grill', packageCode: 'start', durationMonths: 3, subStatus: 'active', restStatus: 'active', startOffset: -10, websiteStatus: 'ready', pwaStatus: 'ready', android: null, ios: null, branches: 2, colors: PALETTE[0]! },
  { name: 'Blue Olive Bistro', slug: 'blue-olive', packageCode: 'start', durationMonths: 6, subStatus: 'active', restStatus: 'active', startOffset: -20, websiteStatus: 'ready', pwaStatus: 'in_setup', android: null, ios: null, branches: 2, colors: PALETTE[1]! },
  { name: 'Cedar & Salt', slug: 'cedar-salt', packageCode: 'start', durationMonths: 3, subStatus: 'expiring_soon', restStatus: 'active', startOffset: -75, websiteStatus: 'ready', pwaStatus: 'ready', android: null, ios: null, branches: 1, colors: PALETTE[2]! },
  { name: 'Demo Diner', slug: 'demo-diner', packageCode: 'start', durationMonths: 3, subStatus: 'expired', restStatus: 'inactive', startOffset: -120, websiteStatus: 'not_tracked', pwaStatus: null, android: null, ios: null, branches: 1, colors: PALETTE[3]! },
  { name: "Falcon's Nest", slug: 'falcons-nest', packageCode: 'start', durationMonths: 3, subStatus: 'not_started', restStatus: 'pending_approval', startOffset: 14, websiteStatus: null, pwaStatus: null, android: null, ios: null, branches: 0, colors: PALETTE[4]! },
  { name: 'Green Fork Kitchen', slug: 'green-fork', packageCode: 'growth', durationMonths: 12, subStatus: 'active', restStatus: 'active', startOffset: -30, websiteStatus: 'ready', pwaStatus: 'ready', android: 'in_preparation', ios: 'not_started', branches: 2, colors: PALETTE[5]! },
  { name: 'Harbor House', slug: 'harbor-house', packageCode: 'growth', durationMonths: 6, subStatus: 'active', restStatus: 'active', startOffset: -40, websiteStatus: 'ready', pwaStatus: 'ready', android: 'submitted_to_store', ios: 'in_preparation', branches: 2, colors: PALETTE[6]! },
  { name: 'Ivory Spoon', slug: 'ivory-spoon', packageCode: 'growth', durationMonths: 3, subStatus: 'expiring_soon', restStatus: 'active', startOffset: -78, websiteStatus: 'ready', pwaStatus: 'ready', android: 'published', ios: 'submitted_to_store', branches: 2, colors: PALETTE[7]! },
  { name: 'Juniper Table', slug: 'juniper-table', packageCode: 'growth', durationMonths: 3, subStatus: 'expired', restStatus: 'inactive', startOffset: -125, websiteStatus: 'ready', pwaStatus: 'in_setup', android: 'published', ios: 'published', branches: 1, colors: PALETTE[0]! },
  { name: "Kelvin's Kitchen", slug: 'kelvins-kitchen', packageCode: 'growth', durationMonths: 6, subStatus: 'not_started', restStatus: 'pending_approval', startOffset: 7, websiteStatus: 'in_setup', pwaStatus: 'not_tracked', android: 'not_started', ios: 'not_started', branches: 1, colors: PALETTE[1]! },
  { name: 'Luna Verde', slug: 'luna-verde', packageCode: 'growth', durationMonths: 12, subStatus: 'active', restStatus: 'active', startOffset: -100, websiteStatus: 'ready', pwaStatus: 'ready', android: 'published', ios: 'published', branches: 2, colors: PALETTE[2]! },
  { name: 'Maple & Main', slug: 'maple-main', packageCode: 'start', durationMonths: 12, subStatus: 'active', restStatus: 'pending', startOffset: -60, websiteStatus: 'in_setup', pwaStatus: null, android: null, ios: null, branches: 2, colors: PALETTE[3]! },
  { name: 'Nomad Noodles', slug: 'nomad-noodles', packageCode: 'start', durationMonths: 6, subStatus: 'expired', restStatus: 'inactive', startOffset: -200, websiteStatus: 'not_tracked', pwaStatus: null, android: null, ios: null, branches: 1, colors: PALETTE[4]! },
  { name: 'Orange Peel Cafe', slug: 'orange-peel', packageCode: 'growth', durationMonths: 6, subStatus: 'active', restStatus: 'active', startOffset: -50, websiteStatus: 'ready', pwaStatus: 'ready', android: 'in_preparation', ios: 'not_started', branches: 2, colors: PALETTE[5]! },
  { name: 'Pike Street Deli', slug: 'pike-street', packageCode: 'start', durationMonths: 6, subStatus: 'expiring_soon', restStatus: 'active', startOffset: -160, websiteStatus: 'ready', pwaStatus: 'ready', android: null, ios: null, branches: 2, colors: PALETTE[6]! },
  { name: 'Quartz Quisine', slug: 'quartz-quisine', packageCode: 'growth', durationMonths: 3, subStatus: 'active', restStatus: 'inactive', startOffset: -15, websiteStatus: 'ready', pwaStatus: 'ready', android: 'published', ios: 'submitted_to_store', branches: 1, colors: PALETTE[7]! },
  { name: 'Rustic Root', slug: 'rustic-root', packageCode: 'start', durationMonths: 6, subStatus: 'active', restStatus: 'active', startOffset: -25, websiteStatus: 'ready', pwaStatus: 'in_setup', android: null, ios: null, branches: 2, colors: PALETTE[0]! },
  { name: 'Saffron Street', slug: 'saffron-street', packageCode: 'growth', durationMonths: 12, subStatus: 'expiring_soon', restStatus: 'active', startOffset: -350, websiteStatus: 'ready', pwaStatus: 'ready', android: 'published', ios: 'published', branches: 2, colors: PALETTE[1]! },
  { name: 'Terra Tomate', slug: 'terra-tomate', packageCode: 'start', durationMonths: 3, subStatus: 'expired', restStatus: 'inactive', startOffset: -150, websiteStatus: null, pwaStatus: 'not_tracked', android: null, ios: null, branches: 1, colors: PALETTE[2]! },
  { name: 'Umbra Umami', slug: 'umbra-umami', packageCode: 'growth', durationMonths: 12, subStatus: 'not_started', restStatus: 'pending_approval', startOffset: 20, websiteStatus: null, pwaStatus: null, android: 'not_started', ios: 'not_started', branches: 0, colors: PALETTE[3]! },
  { name: 'Velvet Vine', slug: 'velvet-vine', packageCode: 'start', durationMonths: 12, subStatus: 'active', restStatus: 'active', startOffset: -80, websiteStatus: 'ready', pwaStatus: 'ready', android: null, ios: null, branches: 2, colors: PALETTE[4]! },
  { name: 'Willow & Wheat', slug: 'willow-wheat', packageCode: 'growth', durationMonths: 3, subStatus: 'active', restStatus: 'active', startOffset: -5, websiteStatus: 'ready', pwaStatus: 'in_setup', android: 'not_started', ios: 'in_preparation', branches: 2, colors: PALETTE[5]! },
  { name: 'Xenon Xpress', slug: 'xenon-xpress', packageCode: 'start', durationMonths: 3, subStatus: 'expiring_soon', restStatus: 'pending', startOffset: -70, websiteStatus: 'in_setup', pwaStatus: null, android: null, ios: null, branches: 1, colors: PALETTE[6]! },
  { name: 'Yarrow Yard', slug: 'yarrow-yard', packageCode: 'growth', durationMonths: 6, subStatus: 'expired', restStatus: 'inactive', startOffset: -210, websiteStatus: 'ready', pwaStatus: 'ready', android: 'submitted_to_store', ios: 'in_preparation', branches: 2, colors: PALETTE[7]! },
  { name: 'Zephyr Kitchen', slug: 'zephyr-kitchen', packageCode: 'start', durationMonths: 3, subStatus: 'active', restStatus: 'active', startOffset: -8, websiteStatus: 'ready', pwaStatus: 'ready', android: null, ios: null, branches: 2, colors: PALETTE[0]! },
  { name: 'Copper Cactus', slug: 'copper-cactus', packageCode: 'growth', durationMonths: 12, subStatus: 'active', restStatus: 'active', startOffset: -45, websiteStatus: 'ready', pwaStatus: 'ready', android: 'published', ios: 'not_started', branches: 2, colors: PALETTE[1]! },
];

const STREETS = ['Corniche Street', 'Nile Avenue', 'Palm Boulevard', 'Market Road', 'Garden Lane'];
const AREAS = ['New Cairo', 'Zamalek', 'Maadi', 'Heliopolis', 'Sheikh Zayed', 'Nasr City'];

const OWNER_NAMES = [
  'Nour Hassan',
  'Omar Farouk',
  'Layla Mansour',
  'Youssef Adel',
  'Mariam Samir',
  'Karim Nabil',
  'Salma Tarek',
  'Ahmed Rami',
];

/** Cairo centre; every seeded branch gets a small offset so the map marker is visible. */
const CAIRO = { lat: 30.0444, lng: 31.2357 };

function buildBranches(index: number, count: number, tenantId: string, baseName: string): Tenant['branches'] {
  return Array.from({ length: count }, (_, b) => {
    const status: Tenant['branches'][number]['status'] = b === 0 ? 'active' : b % 3 === 0 ? 'pending' : 'active';
    return {
      id: `b_${index}_${b}`,
      tenantId,
      name: b === 0 ? `${baseName} — Main` : `${baseName} — Branch ${b + 1}`,
      address: `${10 + b * 7} ${STREETS[b % STREETS.length]}, ${AREAS[(index + b) % AREAS.length]}`,
      phone: `+20 100 ${String(200 + index).padStart(3, '0')} ${String(10 + b).padStart(4, '0')}`,
      status,
      // NW-246: registration-form fields.
      openTime: '10:00',
      closeTime: '23:00',
      menuImageUrl: null,
      latitude: Number((CAIRO.lat + index * 0.012 + b * 0.004).toFixed(6)),
      longitude: Number((CAIRO.lng + index * 0.009 + b * 0.003).toFixed(6)),
    };
  });
}

export function buildSeedTenants(): Tenant[] {
  const today = startOfToday();
  return DESCRIPTORS.map((d, index) => {
    const id = `t_${index + 1}`;
    const tenantId = `NWY-${String(1001 + index)}`;
    const start = addDays(today, d.startOffset);
    const end = addMonths(start, d.durationMonths);
    const created = addDays(start, -3);
    const isGrowth = d.packageCode === 'growth';

    return {
      id,
      tenantId,
      businessName: `${d.name} Co.`,
      restaurantName: d.name,
      contact: {
        phone: `+20 100 ${String(100 + index).padStart(3, '0')} 0000`,
        email: `ops.${d.slug}@example.com`,
        name: OWNER_NAMES[index % OWNER_NAMES.length],
        city: CITY_OPTIONS[index % CITY_OPTIONS.length],
      },
      logoUrl: null,
      description: `${d.name} — demo restaurant registered by the owner.`,
      coverImageUrl: null,
      // NW-247: every seeded restaurant carries the same registration field keys; a
      // restaurant without a commercial register number keeps the key empty.
      commercialRegisterNumber:
        index % 3 === 0 ? `1234567890${String(index).padStart(5, '0')}` : null,
      brandColors: { primary: d.colors[0], secondary: d.colors[1] },
      socialLinks: {
        website: `https://${d.slug}.example.com`,
        instagram: `https://instagram.com/${d.slug}`,
      },
      status: d.restStatus,
      createdAt: created.toISOString(),
      branches: buildBranches(index + 1, d.branches, id, d.name),
      subscription: {
        id: `sub_${index + 1}`,
        tenantId: id,
        packageCode: d.packageCode,
        durationMonths: d.durationMonths,
        status: d.subStatus,
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
        updatedAt: created.toISOString(),
      },
      channels: {
        websiteStatus: d.websiteStatus,
        pwaStatus: d.pwaStatus,
        websiteUrl: d.websiteStatus ? `https://${d.slug}.example.com` : null,
        pwaUrl: d.pwaStatus ? `https://app.${d.slug}.example.com` : null,
        previewUrl: d.websiteStatus === 'ready' ? `https://preview.${d.slug}.example.com` : null,
      },
      apps: {
        android: isGrowth ? d.android : null,
        ios: isGrowth ? d.ios : null,
        androidStoreUrl: d.android === 'published' ? `https://play.google.com/store/apps/details?id=com.${d.slug}` : null,
        iosStoreUrl: d.ios === 'published' ? `https://apps.apple.com/app/${d.slug}/id000000000` : null,
      },
      // OPEN: payment status source, backend.
      paymentStatus: index % 2 === 0 ? 'paid' : 'unpaid',
    };
  });
}

/**
 * NW-247: the dashboard accounts. Internal accounts live in the same store as the
 * tenant accounts; only these sign in to the dashboard.
 */
export function buildSeedAccounts(): SeedAuthAccount[] {
  const today = startOfToday();
  return [
    {
      id: 'acct_seed_1',
      name: 'Nour Hassan',
      email: 'nour.hassan@nawy.example.com',
      accountType: 'internal',
      role: 'super_admin',
      status: 'active',
      password: 'NourPass123!',
      createdAt: addDays(today, -90).toISOString(),
    },
    {
      id: 'acct_seed_2',
      name: 'Omar Farouk',
      email: 'omar.farouk@nawy.example.com',
      accountType: 'internal',
      role: 'support',
      status: 'active',
      password: 'OmarPass123!',
      createdAt: addDays(today, -45).toISOString(),
    },
    {
      id: 'acct_seed_3',
      name: 'Layla Mansour',
      email: 'layla.mansour@nawy.example.com',
      accountType: 'internal',
      role: 'super_admin',
      status: 'inactive',
      createdAt: addDays(today, -120).toISOString(),
    },
    {
      id: 'acct_seed_4',
      name: 'Super Admin',
      email: 'superadmin@nawyorders.com',
      accountType: 'internal',
      role: 'super_admin',
      status: 'active',
      password: 'SuperPass123!',
      createdAt: addDays(today, -200).toISOString(),
    },
    {
      id: 'acct_seed_5',
      name: 'Support User',
      email: 'support@nawyorders.com',
      accountType: 'internal',
      role: 'support',
      status: 'active',
      password: 'SupportPass123!',
      createdAt: addDays(today, -200).toISOString(),
    },
  ];
}

/**
 * NW-247: demo tenant accounts of the seeded restaurants. They are listed on the
 * Accounts page and can be reset from there, but they never sign in to the dashboard.
 */
export function buildSeedTenantAccounts(tenants: Tenant[]): SeedAuthAccount[] {
  const today = startOfToday();
  const hosts = tenants.filter((tenant) => tenant.status === 'active').slice(0, 2);
  const roles: TenantRole[] = ['manager', 'waiter'];
  return hosts.map((tenant, index) => {
    const role = roles[index] ?? 'waiter';
    return {
      id: `tacct_seed_${index + 1}`,
      name: index === 0 ? (tenant.contact.name ?? `${tenant.restaurantName} manager`) : `Demo ${role}`,
      email: `${role}@${tenant.tenantId.toLowerCase()}.example.com`,
      accountType: 'tenant',
      tenantId: tenant.id,
      restaurantRole: role,
      status: 'active',
      password: 'TenantPass123!',
      createdAt: addDays(today, -30 + index).toISOString(),
    };
  });
}

/**
 * Deterministic mock sales history feeding the sales-per-month chart: one record per
 * active tenant per day over the last 365 days with regular gaps. Amounts follow a
 * fixed pattern — no randomness — so demo figures are stable between reloads and
 * clearly fabricated (the pages say so). (AH-239)
 */
export function buildSeedSales(tenants: Tenant[]): SalesRecord[] {
  const today = startOfToday();
  const active = tenants.filter((t) => t.status === 'active');
  if (active.length === 0) return [];

  const records: SalesRecord[] = [];
  for (let dayOffset = 0; dayOffset < 365; dayOffset += 1) {
    if (dayOffset % 4 === 0) continue; // weekly-ish gaps
    const date = toIsoDate(addDays(today, -dayOffset));
    for (let slot = 0; slot < 3; slot += 1) {
      const tenant = active[(dayOffset + slot * 5) % active.length]!;
      const amountEgp = 400 + ((dayOffset * 173 + slot * 613) % 1_800) * 10;
      records.push({
        id: `sal_${dayOffset}_${slot}`,
        tenantId: tenant.id,
        date,
        amountEgp,
      });
    }
  }
  return records;
}

export function buildSeedActivity(tenants: Tenant[]): ActivityLog[] {
  const logs: ActivityLog[] = [];
  const actor = { id: 'u_1', name: 'Nour Hassan', role: 'super_admin' as const };

  tenants.forEach((tenant, index) => {
    logs.push({
      id: `log_seed_${index}_created`,
      timestamp: tenant.createdAt,
      actor,
      action: 'restaurant_created',
      target: { type: 'tenant', tenantId: tenant.id, label: tenant.restaurantName },
      previousValue: null,
      newValue: `${tenant.restaurantName} (${tenant.tenantId})`,
    });
  });

  // A few illustrative follow-up actions.
  const changed = tenants[0];
  if (changed) {
    logs.push({
      id: 'log_seed_pkg',
      timestamp: new Date(startOfToday().getTime() - 5 * 86_400_000).toISOString(),
      actor,
      action: 'package_changed',
      target: { type: 'subscription', tenantId: changed.id, label: `${changed.restaurantName} — subscription` },
      previousValue: 'Start',
      newValue: 'Growth',
    });
  }

  const toggled = tenants[5];
  if (toggled) {
    logs.push({
      id: 'log_seed_feature',
      timestamp: new Date(startOfToday().getTime() - 2 * 86_400_000).toISOString(),
      actor,
      action: 'feature_toggled',
      target: { type: 'feature', tenantId: toggled.id, label: `${toggled.restaurantName} — Android App` },
      previousValue: 'Disabled',
      newValue: 'Enabled',
    });
  }

  return logs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
