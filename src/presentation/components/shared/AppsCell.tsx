import { Badge } from '@/presentation/components/ui/Badge';
import { en } from '@/presentation/i18n/en';
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

/** Mobile app statuses, shown for every tenant (never a dash). */
export function AppsCell({ android, ios }: { android: AppStatus | null; ios: AppStatus | null }) {
  return (
    <span className="flex flex-col gap-1">
      <AppMini label={en.common.platforms.android} status={android} />
      <AppMini label={en.common.platforms.ios} status={ios} />
    </span>
  );
}