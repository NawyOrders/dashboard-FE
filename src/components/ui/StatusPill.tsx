import { Badge } from './Badge';
import type { StatusMeta } from '@/lib/status';

export interface StatusPillProps {
  meta: StatusMeta;
  className?: string;
}

/**
 * A status pill that always renders its text label (never color-only) plus a leading dot.
 */
export function StatusPill({ meta, className }: StatusPillProps) {
  return (
    <Badge tone={meta.tone} withDot className={className}>
      {meta.label}
    </Badge>
  );
}
