import { createContext } from 'react';
import type { AdminUser, Role } from '@/domain/entities';

export interface CurrentUserContextValue {
  user: AdminUser | null;
  role: Role;
  setRole: (role: Role) => void;
}

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export interface ToastInput {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

export interface ToastContextValue {
  push: (toast: ToastInput) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
