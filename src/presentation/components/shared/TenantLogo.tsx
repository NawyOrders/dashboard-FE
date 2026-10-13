import { cn } from '@/presentation/lib/cn';

export interface TenantLogoProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'size-10 rounded-avatar text-sm',
  md: 'size-12 rounded-card text-base',
  lg: 'size-16 rounded-card text-xl',
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0] ?? '').join('').toUpperCase();
}

export function TenantLogo({ name, color = '#E43820', size = 'sm', className }: TenantLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center font-semibold text-white', SIZES[size], className)}
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </span>
  );
}