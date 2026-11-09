import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/presentation/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-card border border-border bg-card', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4 p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  );
}
