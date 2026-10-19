import { useMemo, useState } from 'react';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { PermissionDenied } from '@/presentation/components/shared/PermissionDenied';
import { Card, CardHeader } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Select } from '@/presentation/components/ui/Select';
import { Input } from '@/presentation/components/ui/Input';
import { Pagination } from '@/presentation/components/ui/Pagination';
import { ActivityLogTable } from './ActivityLogTable';
import { useActivity } from '@/presentation/hooks/queries';
import { usePermission } from '@/presentation/hooks/usePermission';
import { en } from '@/presentation/i18n/en';
import { ALL_FILTER_VALUE } from '@/config/filters';
import type { ActivityAction } from '@/domain/entities';

const ACTION_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: en.common.all },
  ...(Object.keys(en.activity.actions) as ActivityAction[]).map((action) => ({
    value: action,
    label: en.activity.actions[action],
  })),
];

export function ActivityLogsPage() {
  const { allowed } = usePermission('activity.view');
  const [action, setAction] = useState<ActivityAction | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useActivity({
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  if (!allowed) {
    return (
      <div>
        <PageHeader title={en.activity.title} subtitle={en.activity.subtitle} />
        <PermissionDenied action="activity.view" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={en.activity.title}
        subtitle={en.activity.subtitle}
        showDemoBadge
        actions={<Badge tone="neutral">{en.activity.readOnly}</Badge>}
      />

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 lg:flex-row lg:items-end">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label={en.activity.filters.action}
              value={action || ALL_FILTER_VALUE}
              onChange={(event) => {
                setAction(
                  event.target.value === ALL_FILTER_VALUE
                    ? ''
                    : (event.target.value as ActivityAction),
                );
                setPage(1);
              }}
              options={ACTION_OPTIONS}
            />
            <Input
              label={en.activity.filters.from}
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
            />
            <Input
              label={en.activity.filters.to}
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardHeader>

        <ActivityLogTable
          logs={pageRows}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => void query.refetch()}
        />

        {query.isSuccess && rows.length > 0 && (
          <Pagination
            page={safePage}
            pageCount={pageCount}
            pageSize={pageSize}
            total={rows.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </Card>
    </div>
  );
}