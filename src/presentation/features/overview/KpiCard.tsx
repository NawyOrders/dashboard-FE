import type { ReactNode } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { cn } from '@/presentation/lib/cn';

type Tint = 'primary' | 'success' | 'neutral' | 'warning';

const TINTS: Record<Tint, string> = {
  primary: 'bg-bg-2 text-primary',
  success: 'bg-success-bg text-success-fg',
  neutral: 'bg-neutral-bg text-neutral-fg',
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
          <Skeleton className="mt-2 h-12 w-20" />
        ) : (
          <p className="tabular text-caption font-caption text-text">{value}</p>
        )}
        {caption && <p className="mt-0.5 text-2xs text-text-muted">{caption}</p>}
      </div>
    </Card>
  );
}