import { useContext } from 'react';
import { ToastContext } from '@/app/contexts';
import type { ToastInput } from '@/app/contexts';

export function useToast(): { toast: (input: ToastInput) => void } {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return { toast: ctx.push };
}