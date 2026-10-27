import { cn } from '@/presentation/lib/cn';

export interface RestaurantNameProps {
  name: string;
  nameAr?: string | null;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}

/** English and Arabic names stacked, each isolated with its own text direction. */
export function RestaurantName({
  name,
  nameAr,
  className,
  primaryClassName,
  secondaryClassName,
}: RestaurantNameProps) {
  return (
    <span className={cn('flex min-w-0 flex-col items-start', className)}>
      <span dir="ltr" className={cn('max-w-full truncate', primaryClassName)}>
        {name}
      </span>
      {nameAr ? (
        <span dir="rtl" className={cn('max-w-full truncate', secondaryClassName)}>
          {nameAr}
        </span>
      ) : null}
    </span>
  );
}
