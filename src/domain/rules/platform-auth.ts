import type { AdminUser, Role } from '@/domain/entities';
import type {
  PlatformAuthError,
  PlatformLoginResponse,
  PlatformRole,
} from '@/domain/entities/platform-auth';

export const PLATFORM_AUTH_ERROR_CODE = {
  invalidCredentials: 'Auth.InvalidCredentials',
  accountLockedOut: 'Auth.AccountLockedOut',
  inactiveAccount: 'Auth.InactiveAccount',
  validation: 'Validation.Error',
} as const;

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

/** Maps platform role names to the dashboard role registry in exactly one place. */
// OPEN: role names, see agent.md section 19
export function mapPlatformRole(role: PlatformRole): Role {
  return role === 'SuperAdmin' ? 'super_admin' : 'support';
}

export function primaryPlatformRole(roles: PlatformRole[]): Role {
  return roles.includes('SuperAdmin') ? 'super_admin' : 'support';
}

export function adminUserFromPlatformLogin(session: PlatformLoginResponse): AdminUser {
  return {
    id: session.userId,
    name: session.fullName,
    email: session.email,
    role: primaryPlatformRole(session.roles),
  };
}

/** Maps `extensions.code` to the exact server message. Unknown codes stay generic. */
export function platformAuthErrorMessage(code: string | undefined): string {
  switch (code) {
    case PLATFORM_AUTH_ERROR_CODE.invalidCredentials:
      return INVALID_CREDENTIALS_MESSAGE;
    case PLATFORM_AUTH_ERROR_CODE.accountLockedOut:
      return 'Your account has been temporarily locked. Please try again later.';
    case PLATFORM_AUTH_ERROR_CODE.inactiveAccount:
      return 'Your account is deactivated. Contact your administrator.';
    default:
      return INVALID_CREDENTIALS_MESSAGE;
  }
}

export function platformAuthError(code: string | undefined): PlatformAuthError {
  const resolved = code ?? PLATFORM_AUTH_ERROR_CODE.invalidCredentials;
  return {
    code: resolved,
    message: platformAuthErrorMessage(resolved),
    extensions: { code: resolved },
  };
}
