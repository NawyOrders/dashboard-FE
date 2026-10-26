/** Platform login contract (agent.md section 18). This is not an `AdminUser`. */
export type PlatformRole = 'SuperAdmin' | 'Support';

export interface PlatformLoginRequest {
  email: string;
  password: string;
}

export interface PlatformLoginResponse {
  userId: string;
  email: string;
  fullName: string;
  roles: PlatformRole[];
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  tokenType: 'Bearer';
}

export interface PlatformAuthError {
  code: string;
  message: string;
  extensions: {
    code: string;
  };
}

/** Server errors are values, never thrown exceptions. */
export type PlatformLoginResult =
  | { ok: true; session: PlatformLoginResponse }
  | { ok: false; error: PlatformAuthError };
