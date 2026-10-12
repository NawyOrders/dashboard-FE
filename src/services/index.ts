import type { Api } from './api';
import { mockApi } from './mock';

/**
 * Active data provider.
 *
 * To switch to a real backend, replace `mockApi` with an HTTP implementation of `Api`
 * (see README.md → "Swapping the mock API for a real one"). Nothing else in the app relies
 * on the mock directly.
 */
export const api: Api = mockApi;

/** Drives the "Demo data" badge in the top bar. */
export const IS_MOCK_PROVIDER = true;
