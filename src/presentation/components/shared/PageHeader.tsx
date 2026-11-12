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

/**
 * The one memorable element of the shell: an operator title block, marked by a
 * primary bar on the inline-start edge and closed by a hairline rule.
 */
export function PageHeader({ title, subtitle, actions, showDemoBadge, demoBadgeTitle }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0 border-s-[3px] border-s-primary ps-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h1 font-h1 text-text">{title}</h1>
          {showDemoBadge && (
            <Badge tone="warning" title={demoBadgeTitle ?? en.app.demoBadgeTitle}>
              {en.app.demoBadge}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-text-muted">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 pb-1">{actions}</div>
      )}
    </header>
  );
}
