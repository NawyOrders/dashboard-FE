import type { ReactNode } from 'react';
import { cn } from '@/presentation/lib/cn';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ items, activeKey, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn('flex flex-wrap items-center gap-1 border-b border-border', className)}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              'inline-flex h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors duration-150',
              active
                ? 'border-primary text-primary-dark'
                : 'border-transparent text-text-muted hover:text-text',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('pt-6', className)}>{children}</div>;
}