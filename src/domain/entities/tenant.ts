import type { BranchStatus, ChannelStatus, AppStatus, RestaurantStatus, Subscription } from './subscription';

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  /** Arabic branch name (fixed display data until the backend returns it). */
  nameAr?: string | null;
  address: string;
  /** City of the address line. */
  city?: string | null;
  phone: string;
  /** Branch status is a separate field from Restaurant Status. */
  status: BranchStatus;
  /** Day the working hours below belong to. */
  workingDay?: string | null;
  /** Opening time in HH:mm (registration form). */
  openTime?: string | null;
  /** Closing time in HH:mm (registration form). */
  closeTime?: string | null;
  /** Menu image uploaded in the registration form. */
  menuImageUrl?: string | null;
  /** Map-picked coordinates. `null` until the owner picks a point. */
  latitude?: number | null;
  longitude?: number | null;
}

export interface TenantContact {
  phone: string;
  email: string;
  /** Owner full name (registration form: `ownerName`). */
  name?: string;
  /** City (registration form: `city`). */
  city?: string | null;
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

export type PaymentStatus = 'paid' | 'unpaid';

export interface Tenant {
  id: string;
  /** Human-readable tenant identifier shown in the UI (monospace). */
  tenantId: string;
  businessName: string;
  restaurantName: string;
  /** Arabic restaurant name (agent.md section 21). Both names are required in the form. */
  restaurantNameAr?: string | null;
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
  /** Restaurant description (registration form: `description`). */
  description?: string | null;
  /** Cover image (registration form: `coverImageUrl`). */
  coverImageUrl?: string | null;
  /** Commercial register number (registration form: `commercialRegisterNumber`). */
  commercialRegisterNumber?: string | null;
  /** Payment flag of the submitted onboarding request (agent.md section 21). */
  paymentStatus?: PaymentStatus;
  /** Submission time returned by the onboarding list. */
  submittedAtUtc?: string | null;
  /** Price the request was submitted with, from the onboarding list. */
  agreedPrice?: number | null;
  agreedCurrency?: string | null;
  /** Raw onboarding status; the dashboard only reviews pending requests for now. */
  onboardingStatus?: number;
  /** Slug of the tenant on the backend, from the tenant endpoints. */
  slug?: string | null;
  /** Set once the backend provisioning finishes (live tenant endpoints). */
  activatedAtUtc?: string | null;
  /** Provisioning error reported by the backend, when the tenant failed to activate. */
  provisioningError?: string | null;
}
