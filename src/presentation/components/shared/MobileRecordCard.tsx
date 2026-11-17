import type { ReactNode } from 'react';
import { cn } from '@/presentation/lib/cn';

export interface MobileRecordField {
  label: string;
  value: ReactNode;
}

export interface MobileRecordCardProps {
  title: ReactNode;
  status?: ReactNode;
  leading?: ReactNode;
  fields?: MobileRecordField[];
  actions?: ReactNode;
  selected?: boolean;
}

/** One stacked data row below the md breakpoint: identity and status, then label/value pairs. */
export function MobileRecordCard({
  title,
  status,
  leading,
  fields = [],
  actions,
  selected,
}: MobileRecordCardProps) {
  return (
    <div className={cn('flex flex-col gap-3 p-4', selected ? 'bg-bg-2' : 'bg-card')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {leading}
          <div className="min-w-0 flex-1">{title}</div>
        </div>
        {status ? <div className="shrink-0">{status}</div> : null}
      </div>

      {fields.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          {fields.map((field) => (
            <div key={field.label} className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-2xs text-text-muted">{field.label}</dt>
              <dd className="min-w-0 break-words text-sm text-text">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
