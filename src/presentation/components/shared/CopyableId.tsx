import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/presentation/lib/cn';

export interface CopyableIdProps {
  value: string;
  className?: string;
}

export function CopyableId({ value, className }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="font-mono text-mono text-text-muted">{value}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${value}`}
        className="inline-flex size-6 items-center justify-center rounded-[8px] text-text-muted transition-colors duration-150 hover:bg-bg-2 hover:text-text"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-3.5 text-success-fg" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </button>
    </span>
  );
}