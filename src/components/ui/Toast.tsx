import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastContext } from '@/app/contexts';
import type { ToastInput } from '@/app/contexts';
import { cn } from '@/lib/cn';

interface ToastItem extends ToastInput {
  id: number;
}

const ICONS = {
  success: <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-success-fg" />,
  error: <AlertCircle aria-hidden="true" className="size-5 shrink-0 text-danger-fg" />,
  info: <Info aria-hidden="true" className="size-5 shrink-0 text-info-fg" />,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 end-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-panel border bg-card p-4 shadow-card',
                toast.variant === 'error' ? 'border-danger-bg' : 'border-border',
              )}
            >
              {ICONS[toast.variant ?? 'success']}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-2xs text-text-muted">{toast.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}