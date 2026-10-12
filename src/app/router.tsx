import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { RestaurantsPage } from '@/features/restaurants/RestaurantsPage';
import { RestaurantDetailsPage } from '@/features/restaurant-details/RestaurantDetailsPage';
import { CreateRestaurantPage } from '@/features/create-restaurant/CreateRestaurantPage';
import { SubscriptionsPage } from '@/features/subscriptions/SubscriptionsPage';
import { PackagesPage } from '@/features/packages/PackagesPage';
import { ActivityLogsPage } from '@/features/activity-logs/ActivityLogsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'restaurants', element: <RestaurantsPage /> },
      { path: 'restaurants/new', element: <CreateRestaurantPage /> },
      { path: 'restaurants/:tenantId', element: <RestaurantDetailsPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'activity', element: <ActivityLogsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);