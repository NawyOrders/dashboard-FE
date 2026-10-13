import type { ReactNode } from 'react';
import { cn } from '@/presentation/lib/cn';

export function InfoRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-0.5 py-2', className)}>
      <span className="text-2xs text-text-muted">{label}</span>
      <span className="text-sm text-text">{children}</span>
    </div>
  );
}

export function InfoList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('divide-y divide-border', className)}>{children}</dl>;
}