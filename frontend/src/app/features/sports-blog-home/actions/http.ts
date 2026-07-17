import { cookies } from 'next/headers';
import { API_BASE_URL } from '../../../configs/queryClient';

// Set by the (not yet built) login flow. Centralized here so every server
// action reads the token from the same place.
export const AUTH_COOKIE_NAME = 'access_token';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
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
