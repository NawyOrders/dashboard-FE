import { Badge } from '@/presentation/components/ui/Badge';
import { channelStatusMeta } from '@/presentation/lib/status';
import type { ChannelStatus } from '@/domain/entities';

function ChannelMini({ label, status }: { label: string; status: ChannelStatus | null }) {
  const meta = channelStatusMeta(status);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-8 text-2xs text-text-muted">{label}</span>
      <Badge tone={meta.tone} withDot className="h-6 px-2">
        {meta.label}
      </Badge>
    </span>
  );
}

export function ChannelCell({
  websiteStatus,
  pwaStatus,
}: {
  websiteStatus: ChannelStatus | null;
  pwaStatus: ChannelStatus | null;
}) {
  return (
    <span className="flex flex-col gap-1">
      <ChannelMini label="Web" status={websiteStatus} />
      <ChannelMini label="PWA" status={pwaStatus} />
    </span>
  );
}