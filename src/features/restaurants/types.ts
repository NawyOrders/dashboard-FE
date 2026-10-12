import type { PackageCode, RestaurantStatus, SubscriptionStatus } from '@/types';

export interface DirectoryFilters {
  packageCode?: PackageCode;
  restaurantStatus?: RestaurantStatus;
  subscriptionStatus?: SubscriptionStatus;
  expiringSoon?: boolean;
  growthOnly?: boolean;
}
