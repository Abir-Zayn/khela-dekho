'use server';

import { apiFetch, setAuthCookies } from '../../../configs/apiClient';

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginResult = { ok: true } | { ok: false; error: string };

// The backend's /api/auth/login accepts a JSON body with email + password
// and returns { access_token, refresh_token }.
//
// Returns a result object instead of throwing: an expected auth failure
// (bad credentials) thrown across the Server Action boundary crashes the
// whole RSC render in production instead of surfacing as a form error.
export async function loginUser(input: LoginInput): Promise<LoginResult> {
  try {
    const tokens = await apiFetch<{ access_token: string; refresh_token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    );
    await setAuthCookies(tokens);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Login failed' };
  }
}
