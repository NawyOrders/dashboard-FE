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
  variant?: 'success' | 'error' | 'neutral';
}

export interface ToastContextValue {
  push: (toast: ToastInput) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export interface AuthContextValue {
  user: AdminUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

