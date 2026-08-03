import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { API_BASE_URL } from './queryClient';

export const AUTH_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

async function authHeader(): Promise<Record<string, string>> {
  try {
    const { getToken } = await auth();
    const clerkToken = await getToken();
    if (clerkToken) {
      return { Authorization: `Bearer ${clerkToken}` };
    }
  } catch {
    // Fall back to cookie store if called outside Clerk request context
  }

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
  const url = `${API_BASE_URL}${path}`;
  const method = rest.method ?? 'GET';

  console.log(`[apiFetch] -> ${method} ${url}`, rest.body ? { body: rest.body } : '');

  const resolvedAuthHeader = await authHeader();
  console.log('[apiFetch] auth header present:', Boolean(resolvedAuthHeader.Authorization));

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...resolvedAuthHeader,
        ...headers,
      },
      cache: 'no-store',
    });
  } catch (err) {
    console.error(`[apiFetch] network error calling ${method} ${url}:`, err);
    throw err;
  }

  console.log(`[apiFetch] <- ${response.status} ${method} ${url}`);

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    console.error(`[apiFetch] error response ${method} ${url}:`, message);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
