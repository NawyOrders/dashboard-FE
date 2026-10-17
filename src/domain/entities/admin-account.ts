import type { Role } from './user';

export type AdminAccountStatus = 'active' | 'inactive';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AdminAccountStatus;
  createdAt: string;
}

export interface CreateAdminAccountInput {
  name: string;
  email: string;
  role: Role;
}
