import { z } from 'zod';
import { readAccessToken } from './access-token';
import { ApiError, describeApiFailure, unwrapApiResponse } from './response';

/**
 * HTTP client for the backend (agent.md section 21).
 *
 * Every response goes through `unwrapApiResponse`, which returns the `data` value and
 * throws `ApiError` when the wrapper reports a failure. The client validates the
 * unwrapped value with the caller's zod schema and turns non-2xx bodies into `ApiError`.
 */

export { ApiError } from './response';

function parseJson(text: string): unknown {
  if (text.trim() === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export interface HttpRequestOptions<T> {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Schema of the unwrapped `data` value; input is untrusted JSON. */
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  /** Exact success status the endpoint contract defines, e.g. 202 on tenant create. */
  expectedStatus?: number;
  /** Auth endpoints set this so a 401 there never starts a refresh loop. */
  skipAuthRetry?: boolean;
}

/** Runs once on a 401; resolves with the new access token, or null when the session ended. */
export type UnauthorizedHandler = () => Promise<string | null>;

export interface HttpClient {
  request<T>(options: HttpRequestOptions<T>): Promise<T>;
  baseUrl: string;
  setUnauthorizedHandler(handler: UnauthorizedHandler | null): void;
}

export interface HttpClientOptions {
  baseUrl: string;
  /** Overridable for tests; defaults to the stored platform token. */
  getAccessToken?: () => string | null;
}

export function createHttpClient({
  baseUrl,
  getAccessToken = readAccessToken,
}: HttpClientOptions): HttpClient {
  const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  let unauthorizedHandler: UnauthorizedHandler | null = null;

  async function request<T>({
    path,
    method = 'GET',
    query,
    body,
    headers,
    signal,
    schema,
    expectedStatus,
    skipAuthRetry = false,
  }: HttpRequestOptions<T>): Promise<T> {
    const url = new URL(path.replace(/^\/+/, ''), root);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    }

    async function send(): Promise<Response> {
      const requestHeaders = new Headers(headers);
      requestHeaders.set('Accept', 'application/json');
      const token = getAccessToken();
      if (token) requestHeaders.set('Authorization', `Bearer ${token}`);

      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      if (body !== undefined && !isFormData && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }

      return fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body:
          body === undefined
            ? undefined
            : isFormData
              ? (body as FormData)
              : JSON.stringify(body),
        signal,
      });
    }

    let response = await send();
    if (response.status === 401 && !skipAuthRetry && unauthorizedHandler) {
      // One refresh attempt, then one retry of this request (agent.md section 28).
      const refreshedToken = await unauthorizedHandler();
      if (!refreshedToken) {
        throw new ApiError(401, 'Your session has expired. Please sign in again.');
      }
      response = await send();
    }

    const payload = parseJson(await response.text());

    if (!response.ok) {
      const failure = describeApiFailure(payload);
      throw new ApiError(
        response.status,
        failure?.message ?? `Request failed with HTTP ${response.status}.`,
        failure?.errors ?? null,
      );
    }

    if (expectedStatus !== undefined && response.status !== expectedStatus) {
      throw new ApiError(
        response.status,
        `Expected HTTP ${expectedStatus} but received ${response.status}.`,
      );
    }

    return schema.parse(unwrapApiResponse(payload, response.status));
  }

  return {
    request,
    baseUrl: root,
    setUnauthorizedHandler(handler) {
      unauthorizedHandler = handler;
    },
  };
}
