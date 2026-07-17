'use server';

import { apiFetch } from '../../../configs/apiClient';
import { loginUser } from './login_user';
import type { AuthUser } from '../types';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const user = await apiFetch<AuthUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  // Registration alone doesn't return tokens, so log the user in right after
  // creating the account — they land authenticated instead of at a dead end.
  await loginUser({ email: input.email, password: input.password });

  return user;
}
