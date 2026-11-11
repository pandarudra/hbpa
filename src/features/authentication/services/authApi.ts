import config from '@/constants/config';
import type { AppUser, ApiErrorResponse } from '../types/auth.types';

/**
 * Thin fetch wrapper. Session is maintained by the browser/native HTTP layer
 * via HttpOnly cookies — credentials: 'include' ensures they are sent.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${config.apiBaseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = (await res.json()) as T | ApiErrorResponse;

  if (!res.ok) {
    const err = data as ApiErrorResponse;
    throw { code: err.code ?? 'UNKNOWN', message: err.message ?? 'Unknown error' };
  }

  return data as T;
}

export const authApi = {
  /** Exchange a Google ID token for an application session. */
  signIn: (idToken: string) =>
    request<{ success: true; user: AppUser }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  /** Clear the server-side session cookie. */
  signOut: () =>
    request<{ success: true }>('/api/auth/logout', { method: 'POST' }),

  /** Return the currently authenticated user, or throw 401 if no session. */
  me: () =>
    request<{ success: true; user: AppUser }>('/api/auth/me'),

  /** Return the allowed email domains configured on the server. */
  getDomains: () =>
    request<{ success: true; domains: string[] }>('/api/auth/domains'),
};
