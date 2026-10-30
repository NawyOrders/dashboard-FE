import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Tabs, TabPanel } from '@/presentation/components/ui/Tabs';
import { Card } from '@/presentation/components/ui/Card';
import { api } from '@/app/composition';
import { useActivity, useTenant, queryKeys } from '@/presentation/hooks/queries';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { en } from '@/presentation/i18n/en';
import { DetailsHeader } from './DetailsHeader';
import { OverviewTab } from './OverviewTab';
import { SubscriptionTab } from './SubscriptionTab';
import { WebsiteTab } from './WebsiteTab';
import { AppsTab } from './AppsTab';
import { BranchesTab } from './BranchesTab';
import { EditTenantDialog } from './EditTenantDialog';
import { ActivityLogTable } from '@/presentation/features/activity-logs/ActivityLogTable';
import type { UpdateTenantInput } from '@/domain/entities';

const TAB_KEYS = ['overview', 'subscription', 'website', 'apps', 'branches', 'activity'] as const;
type TabKey = (typeof TAB_KEYS)[number];

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
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>('overview');
  const [editOpen, setEditOpen] = useState(false);

  const update = useMutation({
    mutationFn: (input: UpdateTenantInput) => api.updateTenant(tenantId, input, user!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenantId) });
      void queryClient.invalidateQueries({ queryKey: ['tenants'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
      setEditOpen(false);
      toast({ title: en.details.tenantUpdated, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({
        title: en.details.tenantUpdateFailed,
        description: error.message,
        variant: 'error',
      });
    },
  });

  const tabItems = [
    { key: 'overview', label: en.details.tabs.overview },
    { key: 'subscription', label: en.details.tabs.subscription },
    { key: 'website', label: en.details.tabs.website },
    { key: 'apps', label: en.details.tabs.apps },
    { key: 'branches', label: en.details.tabs.branches },
    { key: 'activity', label: en.details.tabs.activity },
  ];

  useEffect(() => {
    const requested = searchParams.get('tab');
    if (requested && (TAB_KEYS as readonly string[]).includes(requested)) {
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
        <PageHeader title={en.details.title} />
        <ErrorState
          error={tenant.error ?? new Error(en.details.notFound)}
          onRetry={() => tenant.refetch()}
        />
      </div>
    );
  }

  const data = tenant.data;

  return (
    <div>
      <DetailsHeader tenant={data} onEdit={() => setEditOpen(true)} />

      <Tabs items={tabItems} activeKey={tab} onChange={(key) => setTab(key as TabKey)} />

      <TabPanel>
        {tab === 'overview' && <OverviewTab tenant={data} />}
        {tab === 'subscription' && <SubscriptionTab tenant={data} />}
        {tab === 'website' && <WebsiteTab tenant={data} />}
        {tab === 'apps' && <AppsTab tenant={data} />}
        {tab === 'branches' && <BranchesTab tenant={data} />}
        {tab === 'activity' && <ActivityTab tenantId={data.id} />}
      </TabPanel>

      <EditTenantDialog
        key={data.id}
        open={editOpen}
        tenant={data}
        loading={update.isPending}
        onClose={() => setEditOpen(false)}
        onSubmit={(input) => update.mutate(input)}
      />
    </div>
  );
}
