'use server';

import { apiFetch, setAuthCookies } from '../../../configs/apiClient';

export interface LoginInput {
  email: string;
  password: string;
}

// The backend's /api/auth/login accepts a JSON body with email + password
// and returns { access_token, refresh_token }.
export async function loginUser(input: LoginInput): Promise<void> {
  const tokens = await apiFetch<{ access_token: string; refresh_token: string }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
  await setAuthCookies(tokens);
}
