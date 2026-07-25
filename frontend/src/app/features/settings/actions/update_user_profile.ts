'use server';

import { auth } from '@clerk/nextjs/server';
import { apiFetch } from '../../../configs/apiClient';
import { API_BASE_URL } from '../../../configs/queryClient';
import type { AuthUser } from '../../auth/types';

export interface UserProfileUpdatePayload {
  username?: string;
  full_name?: string;
  bio?: string;
  profile_photo_url?: string;
  location?: string;
  website_url?: string;
  twitter_handle?: string;
  instagram_handle?: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  fields: Record<string, string>;
  file_url: string;
}

export async function updateUserProfile(payload: UserProfileUpdatePayload): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getAvatarUploadUrl(contentType: string): Promise<UploadUrlResponse> {
  return apiFetch<UploadUrlResponse>('/api/users/upload-url', {
    method: 'POST',
    body: JSON.stringify({ content_type: contentType }),
  });
}

export async function uploadAvatarDirectly(formData: FormData): Promise<AuthUser> {
  let authHeaders: Record<string, string> = {};
  try {
    const { getToken } = await auth();
    const clerkToken = await getToken();
    if (clerkToken) {
      authHeaders = { Authorization: `Bearer ${clerkToken}` };
    }
  } catch {
    // Ignore error if not in Clerk request context
  }

  const res = await fetch(`${API_BASE_URL}/api/users/avatar`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Avatar upload failed with status ${res.status}`);
  }

  return res.json();
}
