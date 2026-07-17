import { cookies } from 'next/headers';
import { API_BASE_URL } from './queryClient';

// Written by the login/register actions, read by every server action across
// every feature. Centralized here so there's one place that owns cookie names.
export const AUTH_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

// Matches backend defaults (app/config.py): ACCESS_TOKEN_EXPIRE_MINUTES=30, REFRESH_TOKEN_EXPIRE_DAYS=7.
export async function setAuthCookies(tokens: TokenPair): Promise<void> {
  const store = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  store.set(AUTH_COOKIE_NAME, tokens.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 30,
  });
  store.set(REFRESH_COOKIE_NAME, tokens.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
  store.delete(REFRESH_COOKIE_NAME);
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join(', ');
    }
  } catch {
    // response had no JSON body
  }
  return `Request failed with status ${response.status}`;
}

// Shared fetch wrapper for server actions: attaches the auth cookie (if any),
// talks to the FastAPI backend, and normalizes error responses into thrown Errors.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
