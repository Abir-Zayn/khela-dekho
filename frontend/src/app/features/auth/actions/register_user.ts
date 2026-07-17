'use server';

import { apiFetch } from '../../../configs/apiClient';
import { loginUser } from './login_user';
import type { AuthUser } from '../types';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export type RegisterResult = { ok: true; user: AuthUser } | { ok: false; error: string };

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  let user: AuthUser;
  try {
    user = await apiFetch<AuthUser>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Registration failed' };
  }

  // Registration alone doesn't return tokens, so log the user in right after
  // creating the account — they land authenticated instead of at a dead end.
  const loginResult = await loginUser({ email: input.email, password: input.password });
  if (!loginResult.ok) {
    return { ok: false, error: loginResult.error };
  }

  return { ok: true, user };
}
