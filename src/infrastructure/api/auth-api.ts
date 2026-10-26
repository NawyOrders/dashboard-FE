import type {
  PlatformLoginResponse,
  PlatformLoginResult,
  PlatformRole,
} from '@/domain/entities/platform-auth';
import {
  PLATFORM_AUTH_ERROR_CODE,
  platformAuthError,
} from '@/domain/rules/platform-auth';
import { ApiError } from './http-client';
import type { HttpClient } from './http-client';
import type { LoginResponse } from './auth-schemas';
import { loginResponseSchema } from './auth-schemas';

const LOGIN_PATH = 'api/v1/auth/login';
const PLATFORM_ROLES: readonly PlatformRole[] = ['SuperAdmin', 'Support'];

export interface AuthApi {
  /** Failures are values, never thrown (agent.md section 18). */
  signIn(email: string, password: string): Promise<PlatformLoginResult>;
}

function isPlatformRole(role: string): role is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(role);
}

function flattenErrorValues(errors: Record<string, unknown>): string[] {
  const messages: string[] = [];
  for (const value of Object.values(errors)) {
    if (typeof value === 'string') messages.push(value);
    else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') messages.push(item);
      }
    }
  }
  return messages;
}

/**
 * OPEN: the swagger error responses carry `errors` but no `extensions.code`, so the
 * platform code is recovered from the payload when present and inferred from the HTTP
 * status otherwise.
 */
function errorCode(error: unknown): string {
  if (error instanceof ApiError) {
    const errors = error.errors ?? {};
    const known = [...Object.keys(errors), ...flattenErrorValues(errors)].find(
      (candidate) =>
        candidate.startsWith('Auth.') ||
        candidate === PLATFORM_AUTH_ERROR_CODE.validation,
    );
    if (known) return known;
    if (error.status === 422) return PLATFORM_AUTH_ERROR_CODE.validation;
  }
  return PLATFORM_AUTH_ERROR_CODE.invalidCredentials;
}

function toSession(response: LoginResponse): PlatformLoginResponse {
  return {
    userId: response.userId,
    email: response.email,
    fullName: response.fullName,
    roles: response.roles.filter(isPlatformRole),
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAtUtc: response.expiresAtUtc,
    refreshTokenExpiresAtUtc: response.refreshTokenExpiresAtUtc,
    tokenType: 'Bearer',
  };
}

export function createAuthApi(client: HttpClient): AuthApi {
  return {
    async signIn(email, password) {
      try {
        const response = await client.request({
          path: LOGIN_PATH,
          method: 'POST',
          body: { email, password },
          schema: loginResponseSchema,
        });
        const session = toSession(response);
        if (session.roles.length === 0) {
          return {
            ok: false,
            error: platformAuthError(PLATFORM_AUTH_ERROR_CODE.invalidCredentials),
          };
        }
        return { ok: true, session };
      } catch (error) {
        return { ok: false, error: platformAuthError(errorCode(error)) };
      }
    },
  };
}
