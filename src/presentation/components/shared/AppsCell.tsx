import { Badge } from '@/presentation/components/ui/Badge';
import { appStatusMeta } from '@/presentation/lib/status';
import type { AppStatus } from '@/domain/entities';

function AppMini({ label, status }: { label: string; status: AppStatus | null }) {
  const meta = appStatusMeta(status);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-12 text-2xs text-text-muted">{label}</span>
      <Badge tone={meta.tone} withDot className="h-6 px-2">
        {meta.label}
      </Badge>
    </span>
  );
}

/** Mobile app statuses for Growth tenants; a dash for non-entitled tenants. */
export function AppsCell({ android, ios }: { android: AppStatus | null; ios: AppStatus | null }) {
  if (android === null && ios === null) {
    return <span className="text-text-muted">—</span>;
  }
  return (
    <span className="flex flex-col gap-1">
      <AppMini label="Android" status={android} />
      <AppMini label="iOS" status={ios} />
    </span>
  );
}