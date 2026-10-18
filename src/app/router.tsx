import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { OverviewPage } from '@/presentation/features/overview/OverviewPage';
import { RestaurantsPage } from '@/presentation/features/restaurants/RestaurantsPage';
import { RestaurantDetailsPage } from '@/presentation/features/restaurant-details/RestaurantDetailsPage';
import { ApplicationsPage } from '@/presentation/features/applications/ApplicationsPage';
import { SubscriptionsPage } from '@/presentation/features/subscriptions/SubscriptionsPage';
import { AnalyticsPage } from '@/presentation/features/analytics/AnalyticsPage';
import { AccountsPage } from '@/presentation/features/accounts/AccountsPage';
import { ActivityLogsPage } from '@/presentation/features/activity-logs/ActivityLogsPage';
import { SettingsPage } from '@/presentation/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'restaurants', element: <RestaurantsPage /> },
      { path: 'restaurants/:tenantId', element: <RestaurantDetailsPage /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'activity', element: <ActivityLogsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
