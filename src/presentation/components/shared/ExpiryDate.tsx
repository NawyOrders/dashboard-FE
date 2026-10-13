import { AlertCircle, Clock } from 'lucide-react';
import { formatDate, daysUntil } from '@/domain/rules/date';
import { EXPIRING_SOON_DAYS } from '@/config/policy';
import { cn } from '@/presentation/lib/cn';

export interface ExpiryDateProps {
  endDate: string;
}

export function ExpiryDate({ endDate }: ExpiryDateProps) {
  const days = daysUntil(endDate);
  const expired = days < 0;
  const soon = !expired && days <= EXPIRING_SOON_DAYS;

  return (
    <span
      className={cn(
        'tabular inline-flex items-center gap-1.5 whitespace-nowrap',
        expired && 'font-medium text-danger-fg',
        soon && 'font-medium text-warning-fg',
      )}
    >
      {formatDate(endDate)}
      {expired && <AlertCircle aria-label="Expired" className="size-3.5" />}
      {soon && <Clock aria-label="Expiring soon" className="size-3.5" />}
    </span>
  );
}