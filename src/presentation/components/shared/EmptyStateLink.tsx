import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/presentation/lib/cn';

/** Primary-button-styled link for an empty state's next step (navigation stays a link). */
export function EmptyStateLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-panel bg-primary px-4 py-2 text-center text-sm font-medium text-white',
        'transition-colors duration-150 hover:bg-primary-dark active:bg-primary-dark',
      )}
    >
      {children}
    </Link>
  );
}
