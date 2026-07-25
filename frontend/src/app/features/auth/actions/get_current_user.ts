'use server';

import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { apiFetch, AUTH_COOKIE_NAME } from '../../../configs/apiClient';
import type { AuthUser } from '../types';

// Returns null when logged out instead of throwing, since "no session" is
// the expected steady state for anonymous visitors, not an error.
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { userId } = await auth();
    if (userId) {
      return await apiFetch<AuthUser>('/api/users/me');
    }
  } catch {
    // Continue fallback if not in Clerk server context
  }

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