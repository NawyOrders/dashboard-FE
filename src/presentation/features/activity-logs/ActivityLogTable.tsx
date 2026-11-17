import { en } from '@/presentation/i18n/en';
import { formatDateTime } from '@/domain/rules/date';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { MobileRecordCard } from '@/presentation/components/shared/MobileRecordCard';
import type { ActivityLog } from '@/domain/entities';

export interface ActivityLogTableProps {
  logs: ActivityLog[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  showTarget?: boolean;
}

function ValueCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-text-muted">—</span>;
  return <span className="text-text">{value}</span>;
}

export function ActivityLogTable({
  logs,
  isLoading,
  isError,
  onRetry,
  emptyMessage = en.activity.empty,
  showTarget = true,
}: ActivityLogTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-6 py-4" aria-busy="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (logs.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] border-collapse text-sm">
        <caption className="sr-only">{en.activity.title}</caption>
        <thead>
          <tr className="border-y border-border text-2xs font-medium text-text-muted">
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-start">{en.activity.columns.timestamp}</th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-start">{en.activity.columns.actor}</th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-start">{en.activity.columns.action}</th>
            {showTarget && (
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-start">{en.activity.columns.target}</th>
            )}
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-start">{en.activity.columns.previous}</th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-start">{en.activity.columns.next}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-border last:border-0">
              <td className="tabular whitespace-nowrap px-4 py-4 text-text-muted">
                {formatDateTime(log.timestamp)}
              </td>
              <td className="whitespace-nowrap px-4 py-4">
                <span className="block font-medium text-text">{log.actor.name}</span>
                <span className="block text-2xs text-text-muted">
                  {log.actor.role === 'super_admin' ? en.app.role : en.app.supportRole}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-text">{en.activity.actions[log.action]}</td>
              {showTarget && (
                <td className="max-w-[240px] truncate px-4 py-4 text-text-muted" title={log.target.label}>
                  {log.target.label}
                </td>
              )}
              <td className="whitespace-nowrap px-4 py-4"><ValueCell value={log.previousValue} /></td>
              <td className="whitespace-nowrap px-4 py-4"><ValueCell value={log.newValue} /></td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <ul className="divide-y divide-border md:hidden">
        {logs.map((log) => (
          <li key={log.id}>
            <MobileRecordCard
              title={
                <span className="flex min-w-0 flex-col">
                  <span className="break-words text-sm font-semibold text-text">{log.actor.name}</span>
                  <span className="text-2xs text-text-muted">
                    {log.actor.role === 'super_admin' ? en.app.role : en.app.supportRole}
                  </span>
                </span>
              }
              status={
                <span className="block max-w-[160px] text-end text-2xs font-medium text-text">
                  {en.activity.actions[log.action]}
                </span>
              }
              fields={[
                { label: en.activity.columns.timestamp, value: formatDateTime(log.timestamp) },
                ...(showTarget
                  ? [{ label: en.activity.columns.target, value: log.target.label }]
                  : []),
                { label: en.activity.columns.previous, value: <ValueCell value={log.previousValue} /> },
                { label: en.activity.columns.next, value: <ValueCell value={log.newValue} /> },
              ]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}