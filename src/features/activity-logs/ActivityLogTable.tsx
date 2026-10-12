import { en } from '@/i18n/en';
import { formatDateTime } from '@/lib/date';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { ActivityLog } from '@/types';

export interface ActivityLogTableProps {
  logs: ActivityLog[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
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
  error,
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
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (logs.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
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
                  {log.actor.role === 'super_admin' ? en.app.role : 'Support'}
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
  );
}