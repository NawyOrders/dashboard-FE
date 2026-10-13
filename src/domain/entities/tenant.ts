import type { BranchStatus, ChannelStatus, AppStatus, RestaurantStatus, Subscription } from './subscription';

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  /** Branch status is a separate field from Restaurant Status. */
  status: BranchStatus;
}

export interface TenantContact {
  phone: string;
  email: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
}

export interface WebsiteChannels {
  websiteStatus: ChannelStatus | null;
  pwaStatus: ChannelStatus | null;
  websiteUrl: string | null;
  pwaUrl: string | null;
  previewUrl: string | null;
}

export interface MobileApps {
  /** Delivery state per platform. Independent from package entitlement. */
  android: AppStatus | null;
  ios: AppStatus | null;
  androidStoreUrl: string | null;
  iosStoreUrl: string | null;
}

export interface Tenant {
  id: string;
  /** Human-readable tenant identifier shown in the UI (monospace). */
  tenantId: string;
  businessName: string;
  restaurantName: string;
  contact: TenantContact;
  logoUrl: string | null;
  brandColors: BrandColors;
  socialLinks: SocialLinks;
  status: RestaurantStatus;
  createdAt: string;
  branches: Branch[];
  subscription: Subscription;
  channels: WebsiteChannels;
  apps: MobileApps;
}

/** Payload used when creating a tenant through the mock API. */
export interface CreateTenantInput {
  businessName: string;
  restaurantName: string;
  contact: TenantContact;
  logoUrl: string | null;
  brandColors: BrandColors;
  socialLinks: SocialLinks;
  status: RestaurantStatus;
  packageCode: Subscription['packageCode'];
  durationMonths: Subscription['durationMonths'];
  startDate: string;
  endDate: string;
  branches: Array<Omit<Branch, 'id' | 'tenantId'>>;
}
