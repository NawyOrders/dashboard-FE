import type { PackageCode, RestaurantStatus, SubscriptionStatus } from '@/domain/entities';

export interface DirectoryFilters {
  packageCode?: PackageCode;
  restaurantStatus?: RestaurantStatus;
  subscriptionStatus?: SubscriptionStatus;
  expiringSoon?: boolean;
  growthOnly?: boolean;
}
