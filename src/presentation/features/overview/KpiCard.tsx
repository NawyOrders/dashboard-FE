import type { ReactNode } from 'react';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { cn } from '@/presentation/lib/cn';

type Tint = 'primary' | 'success' | 'neutral' | 'warning';

const TINTS: Record<Tint, string> = {
  primary: 'text-primary',
  success: 'text-success-fg',
  neutral: 'text-text-muted',
  warning: 'text-warning-fg',
};

export interface KpiCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  tint: Tint;
  caption?: string;
  loading?: boolean;
}

/** One cell of the overview operations strip; the strip draws the hairlines. */
export function KpiCard({ label, value, icon, tint, caption, loading }: KpiCardProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-3 bg-card p-5">
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn('shrink-0', TINTS[tint])}>{icon}</span>
        <p className="truncate text-xs font-medium text-text-muted">{label}</p>
      </div>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <p className="tabular text-caption font-caption text-text">{value}</p>
        )}
        {caption && <p className="mt-1 text-2xs text-text-muted">{caption}</p>}
      </div>
    </div>
  );
}
