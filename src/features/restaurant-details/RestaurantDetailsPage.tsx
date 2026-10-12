import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { useActivity, useTenant } from '@/hooks/queries';
import { en } from '@/i18n/en';
import { DetailsHeader } from './DetailsHeader';
import { OverviewTab } from './OverviewTab';
import { SubscriptionTab } from './SubscriptionTab';
import { WebsiteTab } from './WebsiteTab';
import { AppsTab } from './AppsTab';
import { BranchesTab } from './BranchesTab';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';
import { ManageFeaturesDialog } from './ManageFeaturesDialog';
import { ActivityLogTable } from '@/features/activity-logs/ActivityLogTable';

const TAB_KEYS = ['overview', 'subscription', 'website', 'apps', 'branches', 'activity'] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_ITEMS = [
  { key: 'overview', label: en.details.tabs.overview },
  { key: 'subscription', label: en.details.tabs.subscription },
  { key: 'website', label: en.details.tabs.website },
  { key: 'apps', label: en.details.tabs.apps },
  { key: 'branches', label: en.details.tabs.branches },
  { key: 'activity', label: en.details.tabs.activity },
];

function ActivityTab({ tenantId }: { tenantId: string }) {
  const activity = useActivity({ tenantId });
  return (
    <Card>
      <ActivityLogTable
        logs={activity.data ?? []}
        isLoading={activity.isLoading}
        isError={activity.isError}
        error={activity.error}
        onRetry={() => activity.refetch()}
        emptyMessage={en.details.noActivity}
        showTarget={false}
      />
    </Card>
  );
}

export function RestaurantDetailsPage() {
  const { tenantId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const tenant = useTenant(tenantId);
  const [tab, setTab] = useState<TabKey>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  useEffect(() => {
    const requested = searchParams.get('tab');
    if (requested === 'features') {
      setFeaturesOpen(true);
      setTab('overview');
    } else if (requested && (TAB_KEYS as readonly string[]).includes(requested)) {
      setTab(requested as TabKey);
    }
  }, [searchParams]);

  if (tenant.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (tenant.isError || !tenant.data) {
    return (
      <div>
        <PageHeader title="Restaurant details" />
        <ErrorState
          error={tenant.error ?? new Error('Restaurant not found')}
          onRetry={() => tenant.refetch()}
        />
      </div>
    );
  }

  const data = tenant.data;

  return (
    <div>
      <DetailsHeader
        tenant={data}
        onEditSubscription={() => setEditOpen(true)}
        onManageFeatures={() => setFeaturesOpen(true)}
      />

      <Tabs items={TAB_ITEMS} activeKey={tab} onChange={(key) => setTab(key as TabKey)} />

      <TabPanel>
        {tab === 'overview' && <OverviewTab tenant={data} />}
        {tab === 'subscription' && <SubscriptionTab tenant={data} />}
        {tab === 'website' && <WebsiteTab tenant={data} />}
        {tab === 'apps' && <AppsTab tenant={data} />}
        {tab === 'branches' && <BranchesTab tenant={data} />}
        {tab === 'activity' && <ActivityTab tenantId={data.id} />}
      </TabPanel>

      <EditSubscriptionDialog open={editOpen} tenant={data} onClose={() => setEditOpen(false)} />
      <ManageFeaturesDialog open={featuresOpen} tenant={data} onClose={() => setFeaturesOpen(false)} />
    </div>
  );
}