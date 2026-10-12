import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

type Tint = 'primary' | 'success' | 'info' | 'warning';

const TINTS: Record<Tint, string> = {
  primary: 'bg-bg-2 text-primary',
  success: 'bg-success-bg text-success-fg',
  info: 'bg-info-bg text-info-fg',
  warning: 'bg-warning-bg text-warning-fg',
};

export interface KpiCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  tint: Tint;
  caption?: string;
  loading?: boolean;
}

export function KpiCard({ label, value, icon, tint, caption, loading }: KpiCardProps) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <span className={cn('flex size-16 shrink-0 items-center justify-center rounded-full', TINTS[tint])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-sm text-text-muted">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className="tabular text-[32px] font-bold leading-9 text-text">{value}</p>
        )}
        {caption && <p className="mt-0.5 text-2xs text-text-muted">{caption}</p>}
      </div>
    </Card>
  );
}