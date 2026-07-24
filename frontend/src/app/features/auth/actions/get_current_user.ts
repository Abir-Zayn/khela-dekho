'use server';

import { cookies } from 'next/headers';
import { apiFetch, AUTH_COOKIE_NAME } from '../../../configs/apiClient';
import type { AuthUser } from '../types';

// Returns null when logged out instead of throwing, since "no session" is
// the expected steady state for anonymous visitors, not an error.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  if (!store.get(AUTH_COOKIE_NAME)?.value) {
    return null;
  }

  try {
    return await apiFetch<AuthUser>('/api/users/me');
  } catch {
    return null;
  }
}

//Now I would like to work on the Create Post screen .  On the Create Post screen . Use the Lexical Editor package for its high enrich text customizations . Create Post Screen will be similar like the popular platform Medium . 