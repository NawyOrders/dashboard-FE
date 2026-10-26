import type { ReactNode } from 'react';
import { Badge } from '@/presentation/components/ui/Badge';
import { en } from '@/presentation/i18n/en';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showDemoBadge?: boolean;
  demoBadgeTitle?: string;
}

export function PageHeader({ title, subtitle, actions, showDemoBadge, demoBadgeTitle }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-title font-extrabold text-text md:text-h1">{title}</h1>
          {showDemoBadge && (
            <Badge tone="warning" title={demoBadgeTitle ?? en.app.demoBadgeTitle}>
              {en.app.demoBadge}
            </Badge>
          )}
        </div>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}