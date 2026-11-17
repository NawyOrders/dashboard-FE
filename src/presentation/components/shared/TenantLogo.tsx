import { useState } from 'react';
import { cn } from '@/presentation/lib/cn';
import { tenantInitials } from '@/presentation/lib/tenant-initials';
import { tokens } from '@/presentation/theme/tokens';

export interface TenantLogoProps {
  name: string;
  /** Arabic name; its first two letters stand in when the English name is empty. */
  nameAr?: string | null;
  color?: string;
  /** Readable logo URL; initials are shown while it is null or fails to load. */
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'size-10 rounded-avatar text-sm',
  md: 'size-12 rounded-card text-base',
  lg: 'size-16 rounded-card text-xl',
} as const;

export function TenantLogo({
  name,
  nameAr = null,
  color = tokens.colors.primary.DEFAULT,
  src = null,
  size = 'sm',
  className,
}: TenantLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = src && src !== failedSrc ? src : null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden font-semibold text-white',
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className="size-full object-contain"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        tenantInitials(name, nameAr)
      )}
    </span>
  );
}